const cheerio = require('cheerio');
const fs = require('fs');

const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="1624441553" LAST_MODIFIED="1708453483" PERSONAL_TOOLBAR_FOLDER="true">Barra de marcadores</H3>
    <DL><p>
        <DT><A HREF="https://nextjs.org/" ADD_DATE="1642438510" ICON="data:image/png;base64,iVBORw">Next.js</A>
        <DT><H3 ADD_DATE="1646215320" LAST_MODIFIED="1694513681">FP Info</H3>
        <DL><p>
            <DT><A HREF="https://prisma.io/" ADD_DATE="1646215383" ICON="data:image/png;base64,...">Prisma</A>
        </DL><p>
    </DL><p>
</DL><p>
`;

const $ = cheerio.load(html);

const folders = [];

// Enfoque robusto: encontrar cada H3, su nombre es la carpeta
$('h3').each((i, el) => {
    const folderName = $(el).text().trim();
    
    // El siguiente hermano suele ser el DL que contiene los links
    // O está dentro de un padre que tiene un DL
    const dl = $(el).next('dl').length ? $(el).next('dl') : $(el).parent().children('dl').first();
    
    const links = [];
    
    // Buscar los A directamente dentro de este DL (ignorando los que estén en DL anidados)
    // Para ello, filtramos los A cuyo ancestro DL más cercano sea exactamente nuestro DL.
    dl.find('a').each((j, aEl) => {
        const closestDl = $(aEl).closest('dl');
        // Si el DL más cercano al link es este DL actual, entonces el link pertenece a esta carpeta
        if (closestDl[0] === dl[0]) {
            links.push({
                title: $(aEl).text().trim() || 'Sin título',
                url: $(aEl).attr('href'),
                iconUrl: $(aEl).attr('icon')
            });
        }
    });

    if (links.length > 0) {
        folders.push({
            name: folderName,
            links
        });
    }
});

console.log(JSON.stringify(folders, null, 2));

