// deno run --allow-all scripts/fromgoogle.js <name>

import Cajax from 'https://cajax.intera.dev/3.0.4/Cajax.js'
const client = new Cajax("https://google-webfonts-helper.herokuapp.com")

client.get("/api/fonts/"+Deno.args[0])
    .then(res=>res.json())
    .then(async res => {
        const out = {
                name: res.family,
                type: [ res.category.toLowerCase().replaceAll(" ", "-") ],
                url_name: res.id.replaceAll("-", "+"),
                types: []
        }
        const dir = "fonts/"+out.url_name
        out.dir = dir
        console.log(`Output dir: ${out.url_name}`)
        try {
            await Deno.mkdir(dir)
        } catch {}
        for (const variant of res.variants) {
            const entry = {
                    name: variant.fontFamily.replaceAll("'", "")+" "+(variant.fontStyle == "normal" ? "" : variant.fontStyle+" ")+variant.fontWeight,
                    url_name: variant.fontWeight+(variant.fontStyle == "normal" ? "" : variant.fontStyle[0]),
                    style: variant.fontStyle,
                    weight: Number(variant.fontWeight)
            }
            for (const type of ["woff2", "woff", "ttf", "svg"]) {
                if (variant[type]) {
                    entry[type] = entry.url_name + "." + type

                    console.log(`Downloading ${variant[type]}`)

                    const file = await Deno.open(dir + "/" + entry[type], {create: true, write: true})
                    const res = await fetch(variant[type])
                    for await(const chunk of res.body) {
                        await Deno.writeAll(file, chunk);
                    }
                    file.close();
                }
            }

            out.types.push(entry)
        }
        Deno.writeTextFile(dir+"/manifest.json", JSON.stringify(out))
            console.log("DONE")
    })