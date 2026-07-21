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

export async function fetchOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, payment_slips(*)')
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
