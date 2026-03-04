import { getBookmarks } from "@/lib/actions/fp-bookmarks"
import { BookmarkImporter } from "@/components/modules/fp/bookmarks/BookmarkImporter"
import { BookmarkList } from "@/components/modules/fp/bookmarks/BookmarkList"
import { Library } from "lucide-react"

export default async function BookmarksPage() {
    const response = await getBookmarks()
    const folders = response.success ? (response.data || []) : []

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-teal-100 text-teal-600 rounded-xl">
                        <Library className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Marcadores de Chrome</h1>
                        <p className="mt-1 text-sm text-gray-600">Gestor de enlaces y recursos web útiles para la docencia.</p>
                    </div>
                </div>

                <div className="w-full md:w-auto md:min-w-[400px]">
                    <BookmarkImporter />
                </div>
            </div>

            <div className="w-full">
                <BookmarkList folders={folders} />
            </div>
        </div>
    )
}
