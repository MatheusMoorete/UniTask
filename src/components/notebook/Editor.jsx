import { useCallback } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'image'],
    ['clean']
  ],
}

export function Editor({ value, onChange }) {
  const handleChange = useCallback((content) => {
    onChange(content)
  }, [onChange])

  return (
    <ReactQuill 
      theme="snow" 
      value={value} 
      onChange={handleChange}
      modules={modules}
      className="h-[calc(100vh-300px)]"
    />
  )
} 