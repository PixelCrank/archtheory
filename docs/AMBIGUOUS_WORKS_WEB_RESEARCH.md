# Web Research: Ambiguous and Incomplete Works

**Research date:** September 3, 2026  
**Source checked:** Wikimedia/Wikipedia public REST summary API  
**Scope:** Named works from `AMBIGUOUS_WORKS_REVIEW.md`  
**Status key:** `Verified` means the named query returned a live Wikimedia page with a summary and/or image candidate. `Targeted search needed` means the exact title did not resolve through the summary endpoint and needs an institutional or specialist architecture source.

## Verified Wikimedia Records

| Work | Verified source | Verified facts from source | Direct image candidate | Notes |
|---|---|---|---|---|
| High Line | [Wikipedia](https://en.wikipedia.org/wiki/High_Line) | Elevated linear park in New York City; collaboration between Field Operations, Diller Scofidio + Renfro, and Piet Oudolf | [Wikimedia original](https://upload.wikimedia.org/wikipedia/commons/5/5a/High_Line_Park%2C_Section_1a.jpg) | Existing row is likely a duplicate of `The High Line`; merge or distinguish phases |
| Rolex Learning Center in Lausanne | [Wikipedia](https://en.wikipedia.org/wiki/Rolex_Learning_Center) | EPFL library/research center in Lausanne; designed by SANAA; inaugurated in 2010 | [Wikimedia original](https://upload.wikimedia.org/wikipedia/commons/b/b8/Rolex_Learning_center.jpg) | Replace combined source label with `Parametric / Digital` after editorial confirmation |
| Therme Vals | [7132 Thermal Baths](https://en.wikipedia.org/wiki/7132_Thermal_Baths) | Thermal spa complex in Vals; completed in 1996; designed by Peter Zumthor | [Wikimedia image](https://upload.wikimedia.org/wikipedia/commons/9/9c/7132_Thermal_Baths_%26_Hotels.png) | Source page uses the complex's current name rather than `Therme Vals` |
| Royal Crescent | [Wikipedia](https://en.wikipedia.org/wiki/Royal_Crescent) | 30 terraced houses in Bath; designed by John Wood the Younger; built 1767–1774; Georgian architecture | [Wikimedia original](https://upload.wikimedia.org/wikipedia/commons/3/31/Royal.crescent.aerial.bath.arp.jpg) | Add `Georgian` as canonical movement or map to `Neoclassical` explicitly |
| Alhambra | [Wikipedia](https://en.wikipedia.org/wiki/Alhambra) | Palace and fortress complex in Granada; major monument of Islamic architecture | [Wikimedia original](https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Dawn_Charles_V_Palace_Alhambra_Granada_Andalusia_Spain.jpg/3840px-Dawn_Charles_V_Palace_Alhambra_Granada_Andalusia_Spain.jpg) | Add `Islamic / Moorish` as canonical movement rather than forcing it into a European category |
| Church of the Light | [Wikipedia](https://en.wikipedia.org/wiki/Church_of_the_Light) | Ibaraki Kasugaoka Church chapel in Japan; built in 1989; designed by Tadao Ando | [Wikimedia original](https://upload.wikimedia.org/wikipedia/commons/4/4b/Ibaraki_Kasugaoka_Church_light_cross.jpg) | Existing source row appears duplicated elsewhere; consolidate records |
| Markthal Rotterdam | [Market Hall](https://en.wikipedia.org/wiki/Market_Hall_(Rotterdam)) | Mixed residential, office, retail, and market building in Rotterdam; opened in 2014 | [Wikimedia original](https://upload.wikimedia.org/wikipedia/commons/1/1a/Markthal-Rotterdam.jpg) | Replace `Neo-Urbanism / Mixed-Use Architecture` with an approved canonical movement or add typology separately |
| Marina Bay Sands | [Wikipedia](https://en.wikipedia.org/wiki/Marina_Bay_Sands) | Integrated resort in Singapore; opened in 2010; designed by Moshe Safdie | [Wikimedia original](https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Marina_Bay_Sands_%28I%29.jpg/3840px-Marina_Bay_Sands_%28I%29.jpg) | Existing dates and architect are consistent |
| Crystal Palace | [Wikipedia disambiguation](https://en.wikipedia.org/wiki/Crystal_Palace) | Exact query resolves to a disambiguation page, not the 1851 building record | Not accepted from this query | Search specifically for `The Crystal Palace 1851 Joseph Paxton` and verify against a museum or heritage source |

## Exact Query Not Resolved by Wikimedia Summary API

These require a targeted search using the suggested query. The existing sheet record should not be replaced until the title, date, attribution, and image license are verified.

| Work | Suggested search query | Preferred source type | Existing image issue |
|---|---|---|---|
| Continuous Monument | `Superstudio Continuous Monument 1969 project` | Design museum, MoMA, archival exhibition catalogue | `share.google` links; find a stable museum or Wikimedia asset |
| Histograms of Architecture | `Superstudio Histograms of Architecture 1969` | Design museum or Superstudio archive | `share.google` links |
| Supersurface | `Superstudio Supersurface 1971` | Design museum or exhibition catalogue | `share.google` links |
| Twelve Ideal Cities | `Superstudio Twelve Ideal Cities 1971` | Design museum or exhibition catalogue | `share.google` links |
| Bazaar Sofa | `Superstudio Bazaar sofa 1968` | Design museum or furniture collection | `share.google` link; confirm whether it belongs in a building archive |
| Le salon de verre | `Le salon de verre Eileen Gray Paul Ruaud 1922` | Musée des Arts Décoratifs, specialist design source | Existing row has `?` movement and no description |
| Blur Building | `Blur Building Diller Scofidio Renfro 2002 official` | DS+R project page, Swiss architecture source | Existing URL is a Brave image-search proxy |
| Koshino House | `Koshino House Tadao Ando 1979 official` | Tadao Ando Architect & Associates, architecture archive | Existing URL is an architecture-site image; verify rights |
| Hallgrímskirkja | `Hallgrímskirkja Guðjón Samúelsson 1945 1986 official` | Church or Iceland heritage source | Existing Wikipedia page URL is not an image URL |
| Serpentine Pavilion 2013 | `Serpentine Pavilion 2013 Sou Fujimoto official` | Serpentine Galleries official archive | Existing Wikipedia page URL is not an image URL |
| MAXXI Museum | `MAXXI Rome Zaha Hadid official` | MAXXI official site or Zaha Hadid Architects | Existing image may be valid; verify source and movement |
| Sagrada Familia | `Sagrada Familia Antoni Gaudi official history` | Basílica official site or UNESCO | Existing Wikimedia page/image should be replaced with a direct asset if needed |
| Perot Museum of Nature and Science | `Perot Museum Morphosis 2012 official` | Morphosis project page or museum site | Existing URL is a Condé Nast page, not an image URL |
| Absolute World | `Absolute World MAD Architects 2012 official` | MAD Architects or ArchDaily project record | Existing URL is an ArchDaily page, not an image URL |
| The Shard | `The Shard Renzo Piano official project` | Renzo Piano Building Workshop or Sellar | Existing URL is a German Wikipedia page, not an image URL |
| High Line | `High Line Field Operations Diller Scofidio official` | Friends of the High Line or Field Operations | Existing row uses a search-proxy URL; see verified Wikimedia asset above |

## Source Cleanup Rules

- Prefer direct image files from Wikimedia Commons, institutional collections, or architect/venue sites.
- Do not store Wikipedia article URLs in `Image URL`; store a direct image asset URL instead.
- Do not store `share.google` image links without confirming that they are stable, publicly fetchable assets.
- Do not store Brave or other image-search proxy URLs as permanent assets.
- Preserve image attribution and licensing information in the source sheet when available.
- Keep the source movement label in a separate review field until an editor confirms the canonical movement.
- Treat `Description` as missing for all named records in this queue; source summaries should be copied only after editorial review, not blindly imported.

## Alternate Search Leads

The Wikimedia search endpoint returned useful broader records for some exact-title misses. These are leads, not final work-level verification:

| Work(s) | Search lead | Interpretation |
|---|---|---|
| Continuous Monument; Bazaar Sofa | [Superstudio](https://en.wikipedia.org/wiki/Superstudio) | Confirms the collective has a general reference page; individual project facts still need a design-museum or exhibition source |
| Le salon de verre | [Eileen Gray](https://en.wikipedia.org/wiki/Eileen_Gray) | Confirms the designer context; verify the room's date and Paul Ruaud attribution separately |
| Blur Building | [Diller Scofidio + Renfro](https://en.wikipedia.org/wiki/Diller_Scofidio_%2B_Renfro) | Confirms the architects' general record; use the official project archive for building facts |
| Koshino House | [Tadao Ando](https://en.wikipedia.org/wiki/Tadao_Ando) | Confirms architect context; use an architecture archive for the work-level record |
| Hallgrímskirkja | [Hallgrímskirkja](https://en.wikipedia.org/wiki/Hallgr%C3%ADmskirkja) | Alternate spelling/query resolves the work; use the Icelandic church or heritage source for final facts and image |
| Serpentine Pavilion 2013 | [Serpentine Galleries](https://en.wikipedia.org/wiki/Serpentine_Galleries) | Confirms the institution context; the official Serpentine archive is preferred for pavilion details |

The search endpoint began rate-limiting after these requests. The rows above are therefore not marked as fully verified until the work-level source is checked.

## Next Research Pass

1. Search the 15 unresolved named works using the targeted queries above.
2. Prefer official, museum, heritage, university, or architect sources for factual verification.
3. Use Wikimedia Commons API or institutional image endpoints for direct image files.
4. Add verified URLs and facts back to the source sheet.
5. Re-run the converter and confirm that the `Unclassified works` count decreases without reducing the total archive count of 217.

The 22 blank rows cannot be researched online because they contain no identifying title or metadata. They need to be completed or removed in the source sheet first.
