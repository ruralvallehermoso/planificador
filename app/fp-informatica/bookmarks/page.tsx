import { getBookmarks } from "@/lib/actions/fp-bookmarks"
import { BookmarkImporter } from "@/components/modules/fp/bookmarks/BookmarkImporter"
import { BookmarkList } from "@/components/modules/fp/bookmarks/BookmarkList"
import { Library } from "lucide-react"

export default async function BookmarksPage() {
    const response = await getBookmarks()
    const folders = response.success ? (response.data || []) : []

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-100 text-teal-600 rounded-xl">
                    <Library className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Marcadores</h1>
                    <p className="mt-1 text-gray-600">Importa y gestiona tus carpetas y enlaces de la barra de marcadores de Chrome.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Importar desde Chrome</h2>
                        <BookmarkImporter />
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <BookmarkList folders={folders} />
                </div>
            </div>
        </div>
    )
}
