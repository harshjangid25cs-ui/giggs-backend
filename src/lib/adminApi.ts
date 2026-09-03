import { supabase } from './supabaseClient';

export interface PendingWorkerItem {
  id: string;
  user_id: string;
  cooperative_name: string | null;
  verification_status: 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED' | 'REUPLOAD_REQUESTED';
  aadhaar_photo_url: string | null;
  verification_video_url: string | null;
  created_at: string;
  user: {
    name: string;
    phone: string;
    email: string;
    avatar_url: string | null;
    created_at: string;
  };
  skills: { skill_name: string; certified: boolean }[];
  documents: {
    id: string;
    document_type: string;
    document_url: string;
    status: string;
    rejection_reason?: string;
  }[];
}

/**
 * Checks if the given email is in the admin allowlist
 */
export async function checkAdminAllowlist(email: string): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  
  // Check allowlist table
  const { data: allowData, error: allowError } = await (supabase.from as any)('admin_allowlist')
    .select('id')
    .eq('email', cleanEmail)
    .maybeSingle();

  if (!allowError && allowData) {
    return true;
  }

  // Fallback check on users table with role 'admin'
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', cleanEmail)
    .eq('role', 'admin')
    .maybeSingle();

  if (!userError && userData) {
    return true;
  }

  return false;
}

/**
 * Fetches all workers in PENDING verification state
 */
export async function fetchPendingVerificationWorkers(): Promise<PendingWorkerItem[]> {
  const { data: workerRows, error: workerErr } = await supabase
    .from('workers')
    .select(`
      id,
      user_id,
      cooperative_name,
      verification_status,
      aadhaar_photo_url,
      verification_video_url,
      created_at,
      users:user_id (
        name,
        phone,
        email,
        avatar_url,
        created_at
      )
    `)
    .eq('verification_status', 'PENDING' as any)
    .is('removed_at', null)
    .order('created_at', { ascending: false });

  if (workerErr) {
    console.error('Error fetching pending workers:', workerErr);
    return [];
  }

  if (!workerRows || workerRows.length === 0) return [];

  const workerIds = workerRows.map(w => w.id);

  // Fetch skills for these workers
  const { data: skillRows } = await supabase
    .from('worker_skills')
    .select('worker_id, skill_name, certified')
    .in('worker_id', workerIds);

  // Fetch worker documents
  const { data: docRows } = await (supabase.from as any)('worker_documents')
    .select('*')
    .in('worker_id', workerIds);

  return workerRows.map(w => {
    const rawUser = Array.isArray(w.users) ? w.users[0] : w.users;
    const userObj = rawUser || {
      name: 'Unknown Worker',
      phone: 'Unspecified',
      email: '',
      avatar_url: null,
      created_at: w.created_at
    };

    const workerSkills = (skillRows || [])
      .filter(s => s.worker_id === w.id)
      .map(s => ({ skill_name: s.skill_name, certified: !!s.certified }));

    const workerDocs = ((docRows as any[]) || [])
      .filter(d => d.worker_id === w.id)
      .map(d => ({
        id: d.id,
        document_type: d.document_type,
        document_url: d.document_url,
        status: d.status,
        rejection_reason: d.rejection_reason
      }));

    // If worker has aadhaar_photo_url or verification_video_url on workers table, build virtual docs if not in worker_documents table
    if (w.aadhaar_photo_url && !workerDocs.some(d => d.document_type === 'aadhar')) {
      workerDocs.push({
        id: `virtual-aadhar-${w.id}`,
        document_type: 'aadhar',
        document_url: w.aadhaar_photo_url,
        status: 'PENDING_REVIEW',
        rejection_reason: undefined
      });
    }
    if (w.verification_video_url && !workerDocs.some(d => d.document_type === 'video')) {
      workerDocs.push({
        id: `virtual-video-${w.id}`,
        document_type: 'video',
        document_url: w.verification_video_url,
        status: 'PENDING_REVIEW',
        rejection_reason: undefined
      });
    }

    return {
      id: w.id,
      user_id: w.user_id,
      cooperative_name: w.cooperative_name,
      verification_status: w.verification_status as any,
      aadhaar_photo_url: w.aadhaar_photo_url,
      verification_video_url: w.verification_video_url,
      created_at: w.created_at,
      user: userObj,
      skills: workerSkills,
      documents: workerDocs
    };
  });
}

/**
 * Approve a worker
 */
export async function approveWorker(workerId: string, adminUserId?: string) {
  const { data: workerData } = await supabase
    .from('workers')
    .select('user_id')
    .eq('id', workerId)
    .single();

  const { error } = await supabase
    .from('workers')
    .update({
      verification_status: 'VERIFIED' as any,
      identity_verified: true
    })
    .eq('id', workerId);

  if (error) throw error;

  // Write audit log
  await (supabase.from as any)('admin_audit_log').insert({
    admin_id: adminUserId || null,
    action: 'WORKER_VERIFIED',
    target_type: 'worker',
    target_id: workerId,
    notes: 'Approved worker identity and documents.'
  });

  // Notify worker
  if (workerData?.user_id) {
    await (supabase.from as any)('notifications').insert({
      user_id: workerData.user_id,
      title: 'Profile Verified! 🎉',
      message: 'Your Giggs worker profile and documents have been approved. You are now active and bookable.'
    });
  }
}

/**
 * Reject a worker
 */
export async function rejectWorker(workerId: string, reason: string, adminUserId?: string) {
  const { data: workerData } = await supabase
    .from('workers')
    .select('user_id')
    .eq('id', workerId)
    .single();

  const { error } = await supabase
    .from('workers')
    .update({
      verification_status: 'REJECTED' as any
    })
    .eq('id', workerId);

  if (error) throw error;

  // Write audit log
  await (supabase.from as any)('admin_audit_log').insert({
    admin_id: adminUserId || null,
    action: 'WORKER_REJECTED',
    target_type: 'worker',
    target_id: workerId,
    notes: `Reason: ${reason}`
  });

  // Notify worker
  if (workerData?.user_id) {
    await (supabase.from as any)('notifications').insert({
      user_id: workerData.user_id,
      title: 'Verification Update',
      message: `Your worker verification application was not approved. Reason: ${reason}`
    });
  }
}

/**
 * Request document re-upload from a worker
 */
export async function requestWorkerReupload(
  workerId: string,
  docType: string,
  reason: string,
  adminUserId?: string
) {
  const { data: workerData } = await supabase
    .from('workers')
    .select('user_id')
    .eq('id', workerId)
    .single();

  // Set worker status to REUPLOAD_REQUESTED
  const { error: wErr } = await supabase
    .from('workers')
    .update({
      verification_status: 'REUPLOAD_REQUESTED' as any
    })
    .eq('id', workerId);

  if (wErr) throw wErr;

  // Upsert or update worker_documents row
  const { data: existingDoc } = await (supabase.from as any)('worker_documents')
    .select('id')
    .eq('worker_id', workerId)
    .eq('document_type', docType)
    .maybeSingle();

  if (existingDoc) {
    await (supabase.from as any)('worker_documents')
      .update({
        status: 'REJECTED',
        rejection_reason: reason,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', existingDoc.id);
  } else {
    await (supabase.from as any)('worker_documents').insert({
      worker_id: workerId,
      document_type: docType,
      document_url: '',
      status: 'REJECTED',
      rejection_reason: reason,
      reviewed_at: new Date().toISOString()
    });
  }

  // Audit log
  await (supabase.from as any)('admin_audit_log').insert({
    admin_id: adminUserId || null,
    action: 'REUPLOAD_REQUESTED',
    target_type: 'worker',
    target_id: workerId,
    notes: `Document: ${docType}. Reason: ${reason}`
  });

  // Notify worker
  if (workerData?.user_id) {
    await (supabase.from as any)('notifications').insert({
      user_id: workerData.user_id,
      title: 'Action Required: Document Re-upload',
      message: `Admin requested a re-upload of your ${docType.toUpperCase()} document. Reason: ${reason}`
    });
  }
}

/**
 * Fetches all workers across all statuses
 */
export async function fetchAllWorkers(): Promise<PendingWorkerItem[]> {
  const { data: workerRows, error: workerErr } = await supabase
    .from('workers')
    .select(`
      id,
      user_id,
      cooperative_name,
      verification_status,
      aadhaar_photo_url,
      verification_video_url,
      created_at,
      removed_at,
      users:user_id (
        name,
        phone,
        email,
        avatar_url,
        created_at
      )
    `)
    .order('created_at', { ascending: false });

  if (workerErr) {
    console.error('Error fetching all workers:', workerErr);
    return [];
  }

  if (!workerRows || workerRows.length === 0) return [];

  const workerIds = workerRows.map(w => w.id);

  const { data: skillRows } = await supabase
    .from('worker_skills')
    .select('worker_id, skill_name, certified')
    .in('worker_id', workerIds);

  const { data: docRows } = await (supabase.from as any)('worker_documents')
    .select('*')
    .in('worker_id', workerIds);

  return workerRows.map(w => {
    const rawUser = Array.isArray(w.users) ? w.users[0] : w.users;
    const userObj = rawUser || {
      name: 'Unknown Worker',
      phone: 'Unspecified',
      email: '',
      avatar_url: null,
      created_at: w.created_at
    };

    const workerSkills = (skillRows || [])
      .filter(s => s.worker_id === w.id)
      .map(s => ({ skill_name: s.skill_name, certified: !!s.certified }));

    const workerDocs = ((docRows as any[]) || [])
      .filter(d => d.worker_id === w.id)
      .map(d => ({
        id: d.id,
        document_type: d.document_type,
        document_url: d.document_url,
        status: d.status,
        rejection_reason: d.rejection_reason
      }));

    if (w.aadhaar_photo_url && !workerDocs.some(d => d.document_type === 'aadhar')) {
      workerDocs.push({
        id: `virtual-aadhar-${w.id}`,
        document_type: 'aadhar',
        document_url: w.aadhaar_photo_url,
        status: 'PENDING_REVIEW',
        rejection_reason: undefined
      });
    }
    if (w.verification_video_url && !workerDocs.some(d => d.document_type === 'video')) {
      workerDocs.push({
        id: `virtual-video-${w.id}`,
        document_type: 'video',
        document_url: w.verification_video_url,
        status: 'PENDING_REVIEW',
        rejection_reason: undefined
      });
    }

    const status = w.removed_at
      ? 'SUSPENDED'
      : ((w.verification_status as any) || 'PENDING');

    return {
      id: w.id,
      user_id: w.user_id,
      cooperative_name: w.cooperative_name,
      verification_status: status,
      aadhaar_photo_url: w.aadhaar_photo_url,
      verification_video_url: w.verification_video_url,
      created_at: w.created_at,
      user: userObj,
      skills: workerSkills,
      documents: workerDocs
    };
  });
}

/**
 * Soft deletes/suspends a worker
 */
export async function softDeleteWorker(workerId: string, reason: string, adminUserId?: string) {
  const { data: workerData } = await supabase
    .from('workers')
    .select('user_id')
    .eq('id', workerId)
    .single();

  const { error } = await supabase
    .from('workers')
    .update({
      removed_at: new Date().toISOString(),
      verification_status: 'SUSPENDED' as any,
      is_online: false
    })
    .eq('id', workerId);

  if (error) throw error;

  await (supabase.from as any)('admin_audit_log').insert({
    admin_id: adminUserId || null,
    action: 'WORKER_REMOVED',
    target_type: 'worker',
    target_id: workerId,
    notes: `Reason for removal: ${reason}`
  });

  if (workerData?.user_id) {
    await (supabase.from as any)('notifications').insert({
      user_id: workerData.user_id,
      title: 'Account Suspended',
      message: `Your worker profile has been removed by administrative review. Reason: ${reason}`
    });
  }
}

/**
 * Restores a suspended worker back to VERIFIED
 */
export async function restoreWorker(workerId: string, adminUserId?: string) {
  const { data: workerData } = await supabase
    .from('workers')
    .select('user_id')
    .eq('id', workerId)
    .single();

  const { error } = await supabase
    .from('workers')
    .update({
      removed_at: null,
      verification_status: 'VERIFIED' as any,
      identity_verified: true
    })
    .eq('id', workerId);

  if (error) throw error;

  await (supabase.from as any)('admin_audit_log').insert({
    admin_id: adminUserId || null,
    action: 'WORKER_RESTORED',
    target_type: 'worker',
    target_id: workerId,
    notes: 'Worker profile restored to active verified status.'
  });

  if (workerData?.user_id) {
    await (supabase.from as any)('notifications').insert({
      user_id: workerData.user_id,
      title: 'Account Restored! 🎉',
      message: 'Your worker account has been reinstated. You are now visible and bookable again.'
    });
  }
}

/**
 * Service & Category Master Management
 * Returns all services from the DB — the single source of truth for all portals.
 */
export async function fetchServicesMaster() {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('category', { ascending: true });

  if (error) {
    console.error('fetchServicesMaster error:', error);
    return [];
  }
  return data || [];
}

export async function createServiceMaster(service: {
  title: string;
  category: string;
  description: string;
  base_price: number;
}, adminUserId?: string) {
  const { data, error } = await supabase
    .from('services')
    .insert({
      title: service.title,
      category: service.category,
      description: service.description,
      base_price: service.base_price
    })
    .select()
    .single();

  if (error) throw error;

  await (supabase.from as any)('admin_audit_log').insert({
    admin_id: adminUserId || null,
    action: 'SERVICE_CREATED',
    target_type: 'service',
    target_id: data.id,
    notes: `Created new service: ${service.title} (${service.category})`
  });

  return data;
}

export async function updateServiceMaster(
  id: string,
  updates: Partial<{ title: string; category: string; description: string; base_price: number }>,
  adminUserId?: string
) {
  const { error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id);

  if (error) throw error;

  await (supabase.from as any)('admin_audit_log').insert({
    admin_id: adminUserId || null,
    action: 'SERVICE_UPDATED',
    target_type: 'service',
    target_id: id,
    notes: `Updated service properties: ${Object.keys(updates).join(', ')}`
  });
}

export async function deleteServiceMaster(id: string, title: string, adminUserId?: string) {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id);

  if (error) throw error;

  await (supabase.from as any)('admin_audit_log').insert({
    admin_id: adminUserId || null,
    action: 'SERVICE_DELETED',
    target_type: 'service',
    target_id: id,
    notes: `Deleted service category: ${title}`
  });
}

/**
 * Fetch Societies and Resident Users Overview
 */
export async function fetchSocietiesAndResidents() {
  const { data: societies, error: socErr } = await supabase
    .from('societies')
    .select('*')
    .order('name', { ascending: true });

  if (socErr) throw socErr;

  const { data: residents, error: resErr } = await supabase
    .from('users')
    .select('*, societies(name)')
    .eq('role', 'resident')
    .order('created_at', { ascending: false });

  if (resErr) throw resErr;

  return {
    societies: societies || [],
    residents: residents || []
  };
}

