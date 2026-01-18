import { prisma } from '@/lib/prisma';
import { getSubjects } from '@/lib/actions/subjects';
import { SubjectList } from '@/components/modules/master/SubjectList';

export default async function SubjectsPage() {
    const categorySlug = 'master-unie';
    const category = await prisma.category.findUnique({
        where: { slug: categorySlug }
    });

    if (!category) {
        return (
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl">
                Error: Categoría 'master-unie' no encontrada. Por favor ejecuta el seed del sistema.
            </div>
        )
    }

    const { subjects } = await getSubjects(category.id);

    return (
        <SubjectList
            initialSubjects={subjects || []}
            categoryId={category.id}
        />
    )
}
