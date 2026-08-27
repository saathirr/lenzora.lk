import { supabase } from './supabase'

export async function fetchServices() {
  const { data, error } = await supabase.from('services').select('*').order('id')
  if (error) throw error
  return data
}

export async function createService(service) {
  const { data, error } = await supabase.from('services').insert(service).select().single()
  if (error) throw error
  return data
}

export async function updateService(id, updates) {
  const { data, error } = await supabase.from('services').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteService(id) {
  const { error } = await supabase.from('services').delete().eq('id', id)
  if (error) throw error
}

export async function fetchPortfolio() {
  const { data, error } = await supabase.from('portfolio').select('*').order('id')
  if (error) throw error
  return data
}

export async function createPortfolioItem(item) {
  const { data, error } = await supabase.from('portfolio').insert(item).select().single()
  if (error) throw error
  return data
}

export async function deletePortfolioItem(id) {
  const { error } = await supabase.from('portfolio').delete().eq('id', id)
  if (error) throw error
}

export async function fetchProducts() {
  const { data, error } = await supabase.from('products').select('*').order('id')
  if (error) throw error
  return data
}

export async function createProduct(product) {
  const { data, error } = await supabase.from('products').insert(product).select().single()
  if (error) throw error
  return data
}

export async function updateProduct(id, updates) {
  const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

export async function fetchSales() {
  const { data, error } = await supabase.from('sales').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createSale(sale) {
  const { data, error } = await supabase.from('sales').insert(sale).select().single()
  if (error) throw error
  return data
}

export async function updateSale(id, updates) {
  const { data, error } = await supabase.from('sales').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteSale(id) {
  const { error } = await supabase.from('sales').delete().eq('id', id)
  if (error) throw error
}

export async function fetchSiteSettings() {
  const { data, error } = await supabase.from('site_settings').select('*').limit(1).maybeSingle()
  if (error) throw error
  return data
}

export async function updateSiteSettings(id, updates) {
  const { data, error } = await supabase.from('site_settings').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function fetchFrames() {
  const { data, error } = await supabase.from('frames').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createFrame(frame) {
  const { data, error } = await supabase.from('frames').insert(frame).select().single()
  if (error) throw error
  return data
}

export async function updateFrame(id, updates) {
  const { data, error } = await supabase.from('frames').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteFrame(id) {
  const { error } = await supabase.from('frames').delete().eq('id', id)
  if (error) throw error
}

export async function fetchFrameCategories() {
  const { data, error } = await supabase.from('frame_categories').select('*').order('sort_order')
  if (error) throw error
  return data
}

export async function createFrameCategory(category) {
  const { data, error } = await supabase.from('frame_categories').insert(category).select().single()
  if (error) throw error
  return data
}

export async function updateFrameCategory(id, updates) {
  const { data, error } = await supabase.from('frame_categories').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteFrameCategory(id) {
  const { error } = await supabase.from('frame_categories').delete().eq('id', id)
  if (error) throw error
}

export async function fetchFrameCategoryImages() {
  const { data, error } = await supabase.from('frame_category_images').select('*').order('sort_order')
  if (error) throw error
  return data
}

export async function createFrameCategoryImage(image) {
  const { data, error } = await supabase.from('frame_category_images').insert(image).select().single()
  if (error) throw error
  return data
}

export async function deleteFrameCategoryImage(id) {
  const { error } = await supabase.from('frame_category_images').delete().eq('id', id)
  if (error) throw error
}

export async function fetchOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, payment_slips!orders_payment_slip_id_fkey(*)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createOrder(order) {
  const { data, error } = await supabase.from('orders').insert(order).select().single()
  if (error) throw error
  return data
}

export async function updateOrder(id, updates) {
  const { data, error } = await supabase.from('orders').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function fetchCustomerOrders(userOrId) {
  const isIdOnly = typeof userOrId === 'string'
  const userId = isIdOnly ? userOrId : userOrId?.id
  const email = isIdOnly ? null : userOrId?.email

  if (!userId && !email) return []

  let query = supabase
    .from('orders')
    .select('*, payment_slips!orders_payment_slip_id_fkey(slip_url)')
    .order('created_at', { ascending: false })

  query = email
    ? query.or(`user_id.eq.${userId},customer_email.eq.${email}`)
    : query.eq('user_id', userId)

  const { data, error } = await query
  if (error) throw error
  return data
}

export function subscribeToCustomerOrders(userId, callback) {
  const channel = supabase
    .channel(`customer-orders-${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${userId}` },
      (payload) => callback(payload)
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

export async function fetchMessages() {
  const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createMessage(message) {
  const { data, error } = await supabase.from('contact_messages').insert(message).select().single()
  if (error) throw error
  return data
}

export async function updateMessage(id, updates) {
  const { data, error } = await supabase.from('contact_messages').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function createPaymentSlip(slip) {
  const { data, error } = await supabase.from('payment_slips').insert(slip).select().single()
  if (error) throw error
  return data
}

export async function uploadFile(bucket, path, file) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  })
  if (error) throw error
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)
  return urlData.publicUrl
}

export async function fetchAnalytics() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('amount, status, created_at')
    .in('status', ['Completed', 'In Progress'])
  if (error) throw error
  return orders
}

export function subscribeToOrders(callback) {
  const channel = supabase
    .channel('orders-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      (payload) => callback(payload)
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

export async function fetchConversations() {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchMyConversations(userId) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('customer_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createConversation(conversation) {
  const { data, error } = await supabase
    .from('conversations')
    .insert(conversation)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateConversation(id, updates) {
  const { data, error } = await supabase
    .from('conversations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchMessagesByConversation(conversationId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function addMessageToConversation(message) {
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select()
    .single()
  if (error) throw error
  return data
}

export function subscribeToMessages(conversationId, callback) {
  const channel = supabase
    .channel(`messages-${conversationId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      (payload) => callback(payload.new)
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}