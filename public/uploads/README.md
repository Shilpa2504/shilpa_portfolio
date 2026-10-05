# Optional future asset replacements

The current portrait, resume, eight StudyMate screenshots, and ten Pizzeria screenshots are already integrated from [../assets](../assets) through [../../scripts/supplied-assets.mjs](../../scripts/supplied-assets.mjs). **No renaming or additional uploads are required.** For future additions or portrait/resume replacements, this optional folder supports the names below. PNG, JPG, JPEG, and WebP are supported; keep the original extension. Do not recreate, crop, or recolor screenshots.

| File basename | Image from the latest message |
| --- | --- |
| portrait | Your outdoor portrait (last image) |
| studymate-qa | AI Document Assistant / uploaded PDF / answer |
| studymate-documents | My Documents list |
| studymate-home | Light-mode study dashboard |
| studymate-dark | Dark-mode study dashboard |
| pizzeria-assistant | Pizza Assistant conversation and cart actions |
| pizzeria-home | Pizzeria home screen |
| pizzeria-menu | Searchable pizza menu |
| pizzeria-meal | Describe your meal / Build My Meal |
| resume.pdf | Your latest supplied resume, saved as a PDF |

For example, `portrait.jpg` and `studymate-home.png` are recognized automatically. Once saved, the development server refreshes the media manifest. A fresh production build also detects these files. No source-code edits are required.

An optional portrait or PDF here overrides the corresponding original asset; recognized project images are added to their galleries. Otherwise the current supplied assets remain in use. Both View Resume and Download Resume use the supplied original PDF; the old generated resume is no longer used.

Only filenames in this table (plus `shilpa`, `latest-resume.pdf`, and `shilpa-resume.pdf`) are recognized. Other files are not silently repurposed. Avoid saving confidential documents here: this is a public website asset folder.