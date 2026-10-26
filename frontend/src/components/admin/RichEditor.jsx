import { lazy, Suspense } from 'react'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = lazy(() => import('react-quill-new'))

const modules = {
  toolbar: [[{ header: [2, 3, false] }], ['bold', 'italic', 'underline'], [{ list: 'ordered' }, { list: 'bullet' }], ['link', 'image'], ['clean']],
}

export default function RichEditor({ value, onChange, placeholder }) {
  return (
    <div className="rich-editor overflow-hidden rounded-sm border border-line [&_.ql-container]:min-h-48 [&_.ql-container]:border-0 [&_.ql-container]:font-sans [&_.ql-container]:text-[15px] [&_.ql-editor]:font-sans [&_.ql-editor]:text-[15px] [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-line">
      <Suspense fallback={<div className="h-56 animate-pulse bg-mist" />}>
        <ReactQuill theme="snow" value={value || ''} onChange={onChange} modules={modules} placeholder={placeholder} />
      </Suspense>
    </div>
  )
}
