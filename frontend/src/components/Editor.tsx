import {
  useEditor,
  EditorContent,
  useEditorState,
  type JSONContent,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";

import { useState, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline as UnderIcon,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Unlink,
  X,
  ImagePlus,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";
import { type ReactNode } from "react";

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  icon: ReactNode;
  title: string;
  className?: string;
}

const ToolbarButton = ({
  onClick,
  active = false,
  disabled = false,
  icon,
  title,
  className = "",
}: ToolbarButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`
      p-2 rounded-md transition-all duration-200 flex items-center justify-center
      ${
        active
          ? "bg-primary text-primary-foreground shadow-sm scale-95"
          : "text-foreground/70 hover:bg-gray-200 hover:text-foreground active:bg-gray-300"
      }
      ${disabled ? "opacity-20 cursor-not-allowed" : "cursor-pointer"}
      ${className}
    `}
  >
    {icon}
  </button>
);
import { toast } from "sonner";
import { uploadImage } from "@/api/client";

interface EditorProps {
  initialContent?: JSONContent;
  onChange: (json: JSONContent) => void;
}

type TiptapEditor = Awaited<ReturnType<typeof useEditor>>;

const isImageFile = (file: File): boolean => {
  return file.type.startsWith("image/");
};

const uploadImageToServer = async (file: File): Promise<string> => {
  const uploadToastId = toast.loading("Uploading image...");
  try {
    const url = await uploadImage(file);
    toast.success("Image uploaded successfully!", { id: uploadToastId });
    return url;
  } catch (error) {
    toast.error("Failed to upload image", { id: uploadToastId });
    throw error;
  }
};

const handleImageFiles = async (files: File[], editor: TiptapEditor) => {
  for (const file of files.filter(isImageFile)) {
    try {
      const url = await uploadImageToServer(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch {
      /* empty */
    }
  }
};

export const Editor = ({ initialContent, onChange }: EditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc ml-4",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal ml-4",
          },
        },
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          HTMLAttributes: {
            class: "text-primary underline cursor-pointer",
          },
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
        defaultAlignment: "left",
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class:
            "rounded-lg border border-border shadow-sm max-w-full h-auto my-4",
        },
      }),
    ],
    editorProps: {
      handleDrop: (__view, event) => {
        event.preventDefault();
        const files = Array.from(event.dataTransfer?.files || []);
        if (editor) {
          handleImageFiles(files, editor);
        }
        return true;
      },
      handlePaste: (__view, event) => {
        const items = event.clipboardData?.items;
        if (!items || !editor) return false;

        const files: File[] = [];
        for (let i = 0; i < items.length; i++) {
          if (items[i].kind === "file") {
            const file = items[i].getAsFile();
            if (file && isImageFile(file)) {
              files.push(file);
            }
          }
        }

        if (files.length > 0) {
          event.preventDefault();
          handleImageFiles(files, editor);
          return true;
        }

        return false;
      },
    },
    content: initialContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isAlignLeft: ctx.editor?.isActive({ textAlign: "left" }) ?? false,
      isAlignCenter: ctx.editor?.isActive({ textAlign: "center" }) ?? false,
      isAlignRight: ctx.editor?.isActive({ textAlign: "right" }) ?? false,
      isAlignJustify: ctx.editor?.isActive({ textAlign: "justify" }) ?? false,
      isBulletList: ctx.editor?.isActive("bulletList") ?? false,
      isOrderedList: ctx.editor?.isActive("orderedList") ?? false,
      canUndo: ctx.editor?.can().undo() ?? false,
      canRedo: ctx.editor?.can().redo() ?? false,
      isBold: ctx.editor?.isActive("bold") ?? false,
      isItalic: ctx.editor?.isActive("italic") ?? false,
      isUnderline: ctx.editor?.isActive("underline") ?? false,
      isH1: ctx.editor?.isActive("heading", { level: 1 }) ?? false,
      isH2: ctx.editor?.isActive("heading", { level: 2 }) ?? false,
      isH3: ctx.editor?.isActive("heading", { level: 3 }) ?? false,
      isLink: ctx.editor?.isActive("link") ?? false,
    }),
  });

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkText, setLinkText] = useState("Link");

  const addImage = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0 && editor) {
        handleImageFiles(files, editor);
      }
    };
    input.click();
  }, [editor]);

  const openLinkModal = useCallback(() => {
    editor?.chain().focus().extendMarkRange("link").run();
    if (editorState?.isLink) {
      const href = editor?.getAttributes("link").href as string;
      if (href) setLinkUrl(href);
    }
    setIsLinkModalOpen(true);
  }, [editor, editorState?.isLink]);

  const closeLinkModal = () => {
    setIsLinkModalOpen(false);
    setLinkUrl("https://");
  };

  const applyLink = () => {
    if (!linkUrl.trim() || !linkText.trim()) {
      return;
    }

    if (!editor) return;

    editor.chain().focus().run();

    const selection = editor.state.selection;
    const isEmptySelection = selection.empty;

    if (isEmptySelection) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: "text",
          text: linkText,
          marks: [{ type: "link", attrs: { href: linkUrl } }],
        })
        .run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    }

    closeLinkModal();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      applyLink();
    }
    if (e.key === "Escape") {
      closeLinkModal();
    }
  };

  if (!editor) return null;

  return (
    <div className="flex flex-col border rounded-xl overflow-hidden bg-white h-full min-h-125 shadow-sm border-border">
      {/* TOOLBAR START */}
      <div className="flex-none flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50/50 backdrop-blur-md">
        {/* Group: History */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editorState?.canUndo}
            icon={<Undo size={16} />}
            title="Undo"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editorState?.canRedo}
            icon={<Redo size={16} />}
            title="Redo"
          />
        </div>

        {/* Group: Lists */}
        <div className="flex items-center gap-1 px-2 border-r border-gray-300">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editorState?.isBulletList}
            icon={<List size={16} />}
            title="Bullet List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editorState?.isOrderedList}
            icon={<ListOrdered size={16} />}
            title="Ordered List"
          />
        </div>

        {/* Group: Alignment */}
        <div className="flex items-center gap-1 px-2 border-r border-gray-300">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editorState?.isAlignLeft}
            icon={<AlignLeft size={16} />}
            title="Align Left"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editorState?.isAlignCenter}
            icon={<AlignCenter size={16} />}
            title="Align Center"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            active={editorState?.isAlignRight}
            icon={<AlignRight size={16} />}
            title="Align Right"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            active={editorState?.isAlignJustify}
            icon={<AlignJustify size={16} />}
            title="Justify"
          />
        </div>

        {/* Group: Typography */}
        <div className="flex items-center gap-1 px-2 border-r border-gray-300">
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            active={editorState?.isH1}
            icon={<Heading1 size={16} />}
            title="Heading 1"
          />
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            active={editorState?.isH2}
            icon={<Heading2 size={16} />}
            title="Heading 2"
          />
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            active={editorState?.isH3}
            icon={<Heading3 size={16} />}
            title="Heading 3"
          />
        </div>

        {/* Group: Text Formatting */}
        <div className="flex items-center gap-1 px-2 border-r border-gray-300">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editorState?.isBold}
            icon={<Bold size={16} />}
            title="Bold"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editorState?.isItalic}
            icon={<Italic size={16} />}
            title="Italic"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editorState?.isUnderline}
            icon={<UnderIcon size={16} />}
            title="Underline"
          />
        </div>

        {/* Group: Media & Links */}
        <div className="flex items-center gap-1 pl-2">
          <ToolbarButton
            onClick={addImage}
            icon={<ImagePlus size={16} />}
            title="Add Image"
            className="hover:bg-blue-50 hover:text-blue-600"
          />
          <ToolbarButton
            onClick={openLinkModal}
            active={editorState?.isLink}
            icon={<LinkIcon size={16} />}
            title="Insert Link"
            className="active:bg-blue-600 active:text-white"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={!editorState?.isLink}
            icon={<Unlink size={16} />}
            title="Remove Link"
          />
        </div>
      </div>
      {/* TOOLBAR END */}

      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <EditorContent
          className="tiptap-content flex-1 overflow-y-auto p-6 prose max-w-none focus:outline-none"
          editor={editor}
        />
      </div>

      {isLinkModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 flex items-center justify-center p-4 animate-in fade-in duration-300"
            onClick={closeLinkModal}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card rounded-2xl shadow-2xl border border-border max-w-sm w-full z-70 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <LinkIcon size={16} className="text-primary" />
                {editorState?.isLink ? "Edit Link" : "Insert Link"}
              </h3>
              <button
                onClick={closeLinkModal}
                className="p-1.5 hover:bg-secondary rounded-full transition-colors text-foreground/50 hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground/60">
                  Display Text
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g. My Website"
                  className="w-full px-4 py-2.5 bg-secondary/50 text-foreground placeholder-foreground/30 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground/60">
                  Destination URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2.5 bg-secondary/50 text-foreground placeholder-foreground/30 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {(linkText || linkUrl) && (
                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                  <p className="text-[10px] font-bold text-primary/60 uppercase mb-1 px-1">
                    Preview
                  </p>
                  <div className="flex items-center gap-2 px-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm text-primary underline font-medium truncate">
                      {linkText || linkUrl}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-muted/20 border-t border-border flex justify-end gap-3">
              <button
                type="button"
                onClick={closeLinkModal}
                className="px-4 py-2 text-sm text-foreground/70 hover:text-foreground font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={applyLink}
                disabled={!linkUrl.trim() || linkUrl === "https://"}
                className="px-6 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100 transition-all shadow-md shadow-primary/20"
              >
                {editorState?.isLink ? "Update" : "Insert Link"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
