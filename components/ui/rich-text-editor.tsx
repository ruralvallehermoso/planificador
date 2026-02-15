"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { Bold, Italic, List, ListOrdered, Underline as UnderlineIcon, Link as LinkIcon, ImageIcon, SplitSquareVertical } from 'lucide-react'
import { Toggle } from "@/components/ui/toggle"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-500 hover:text-blue-700 underline',
                },
            }),
            Image.configure({
                inline: false,
                allowBase64: true,
                HTMLAttributes: {
                    class: 'max-w-full h-auto rounded-md my-2',
                },
            }),
        ],
        content: value,
        editorProps: {
            attributes: {
                class: cn(
                    "min-h-[400px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 prose prose-sm max-w-none dark:prose-invert",
                    className
                ),
            },
            handlePaste: (view, event) => {
                const items = event.clipboardData?.items
                if (!items) return false

                for (const item of Array.from(items)) {
                    if (item.type.startsWith('image/')) {
                        event.preventDefault()
                        const file = item.getAsFile()
                        if (!file) continue

                        const reader = new FileReader()
                        reader.onload = (e) => {
                            const base64 = e.target?.result as string
                            if (base64) {
                                view.dispatch(
                                    view.state.tr.replaceSelectionWith(
                                        view.state.schema.nodes.image.create({ src: base64 })
                                    )
                                )
                            }
                        }
                        reader.readAsDataURL(file)
                        return true
                    }
                }

                return false
            },
            handleDrop: (view, event) => {
                const files = event.dataTransfer?.files
                if (!files || files.length === 0) return false

                for (const file of Array.from(files)) {
                    if (file.type.startsWith('image/')) {
                        event.preventDefault()
                        const reader = new FileReader()
                        reader.onload = (e) => {
                            const base64 = e.target?.result as string
                            if (base64) {
                                const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
                                if (pos) {
                                    view.dispatch(
                                        view.state.tr.insert(
                                            pos.pos,
                                            view.state.schema.nodes.image.create({ src: base64 })
                                        )
                                    )
                                }
                            }
                        }
                        reader.readAsDataURL(file)
                        return true
                    }
                }

                return false
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    if (!editor) {
        return null
    }

    return (
        <div className="border rounded-md overflow-hidden bg-white shadow-sm">
            <div className="flex flex-wrap items-center gap-1 border-b bg-gray-50/50 p-2">
                <Toggle
                    size="sm"
                    pressed={editor.isActive('bold')}
                    onPressedChange={() => editor.chain().focus().toggleBold().run()}
                    aria-label="Toggle bold"
                >
                    <Bold className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('italic')}
                    onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                    aria-label="Toggle italic"
                >
                    <Italic className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('underline')}
                    onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
                    aria-label="Toggle underline"
                >
                    <UnderlineIcon className="h-4 w-4" />
                </Toggle>
                <span className="w-px h-6 bg-gray-200 mx-1" />
                <Toggle
                    size="sm"
                    pressed={editor.isActive('heading', { level: 2 })}
                    onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    aria-label="Toggle h2"
                    className="font-bold text-xs"
                >
                    H2
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('heading', { level: 3 })}
                    onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    aria-label="Toggle h3"
                    className="font-bold text-xs"
                >
                    H3
                </Toggle>
                <span className="w-px h-6 bg-gray-200 mx-1" />
                <Toggle
                    size="sm"
                    pressed={editor.isActive('bulletList')}
                    onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                    aria-label="Toggle bullet list"
                >
                    <List className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('orderedList')}
                    onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                    aria-label="Toggle ordered list"
                >
                    <ListOrdered className="h-4 w-4" />
                </Toggle>
                <span className="w-px h-6 bg-gray-200 mx-1" />
                <Toggle
                    size="sm"
                    pressed={false}
                    onPressedChange={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = 'image/*'
                        input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0]
                            if (!file) return
                            const reader = new FileReader()
                            reader.onload = (ev) => {
                                const base64 = ev.target?.result as string
                                if (base64) {
                                    editor.chain().focus().setImage({ src: base64 }).run()
                                }
                            }
                            reader.readAsDataURL(file)
                        }
                        input.click()
                    }}
                    aria-label="Insertar imagen"
                    title="Insertar imagen (también puedes pegar desde el portapapeles)"
                >
                    <ImageIcon className="h-4 w-4" />
                </Toggle>
            </div>
            <EditorContent editor={editor} className={cn("p-2", className)} />
        </div>
    )
}
