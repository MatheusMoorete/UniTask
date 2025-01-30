export function ErrorToast({ error }) {
  if (!error) return null
  
  return (
    <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {error}
    </div>
  )
} 