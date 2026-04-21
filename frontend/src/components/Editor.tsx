import {
  useEditor,
  EditorContent,
  useEditorState,
  type JSONContent,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { Bold, Italic, Underline as UnderIcon, Undo, Redo } from "lucide-react";

interface EditorProps {
  initialContent?: JSONContent;
  onChange: (json: JSONContent) => void;
}

export const Editor = ({ initialContent, onChange }: EditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: initialContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      canUndo: ctx.editor?.can().undo() ?? false,
      canRedo: ctx.editor?.can().redo() ?? false,
      isBold: ctx.editor?.isActive("bold") ?? false,
      isItalic: ctx.editor?.isActive("italic") ?? false,
      isUnderline: ctx.editor?.isActive("underline") ?? false,
    }),
  });

  if (!editor) return null;

  return (
    <div className="flex flex-col border rounded-lg overflow-hidden bg-white h-full min-h-125">
      <div className="flex-none flex flex-wrap gap-2 p-2 border-b bg-gray-50">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editorState?.canUndo}
          className="p-2 border rounded disabled:opacity-30 hover:bg-gray-100"
        >
          <Undo size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editorState?.canRedo}
          className="p-2 border rounded disabled:opacity-30 hover:bg-gray-100"
        >
          <Redo size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded border ${editorState?.isBold ? "bg-black text-white" : "bg-white"}`}
        >
          <Bold size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded border ${editorState?.isItalic ? "bg-black text-white" : "bg-white"}`}
        >
          <Italic size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded border ${editorState?.isUnderline ? "bg-black text-white" : "bg-white"}`}
        >
          <UnderIcon size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 focus:outline-none">
        <EditorContent
          className="tiptap-content h-full prose max-w-none prose-headings:scroll-m-20 prose-p:scroll-m-6"
          editor={editor}
        />
      </div>
    </div>
  );
};
