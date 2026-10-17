// GitHub Pages não conhece ids criados no navegador (/campanhas/abc123/...).
// O 404.html leva a URL para a página-modelo (ids "_") e guarda a URL real em ?p=.
import { writeFileSync } from "node:fs";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>Mesa</title></head>
<body><p id="msg">Carregando…</p>
<script>
  var base = ${JSON.stringify(basePath)};
  var path = location.pathname.slice(base.length).replace(/\\/+$/, "");
  var m = path.match(/^\\/campanhas\\/([^/]+)((?:\\/(?:ficha|sessoes|notas|dados))?|\\/personagens\\/([^/]+)(?:\\/aparencia)?)$/);
  if (m && m[1] !== "_") {
    var model = path.replace(/^\\/campanhas\\/[^/]+/, "/campanhas/_").replace(/\\/personagens\\/[^/]+/, "/personagens/_");
    location.replace(base + model + "/?p=" + encodeURIComponent(location.pathname));
  } else {
    document.getElementById("msg").innerHTML = 'Página não encontrada. <a href="' + base + '/campanhas/">Voltar para campanhas</a>';
  }
</script></body></html>
`;

writeFileSync("out/404.html", html);
