/* eslint-disable */
/**
 * Catálogo e desenho do retrato (E12), copiados do protótipo de UX v0.5 (ux/prototipo.html)
 * sem mudar a arte, para o app e o protótipo continuarem iguais e a próxima versão do UX
 * poder ser trazida de novo com uma cópia. Ajustes do porte: avatarSvg recebe o prefixo dos
 * ids em vez de um contador global e, sem título, sai decorativo (aria-hidden).
 * Quem desenha é portraitSvg.ts, que só entrega configurações validadas por normalizePortrait
 * (ids do catálogo e cores #rrggbb), então nada vindo do usuário chega cru ao SVG.
 */
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function sh(hex,a){const n=parseInt(hex.slice(1),16);const f=v=>Math.max(0,Math.min(255,Math.round(a<0?v*(1+a/100):v+(255-v)*a/100)));return "#"+((1<<24)|(f(n>>16)<<16)|(f(n>>8&255)<<8)|f(n&255)).toString(16).slice(1)}
function mix(a,b,t){const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const A=p(a),B=p(b);return "#"+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,"0")).join("")}
const PAL={
  pele:[["Porcelana","#F6DCC6"],["Clara","#EFC7A6"],["Pêssego","#E2A97F"],["Dourada","#D9A066"],["Oliva","#C48E5C"],["Canela","#A36B42"],["Morena","#8A5634"],["Retinta","#5E3820"],["Ébano","#43281A"],["Verde orc","#7FA05A"],["Verde goblin","#9DB860"],["Vermelho infernal","#B54A3C"],["Azul feérico","#7FA7D6"],["Cinza pedra","#9AA0A6"],["Lilás","#A88FC4"],["Bronze","#B98A4E"]],
  cabelo:[["Preto","#1E1A18"],["Castanho escuro","#3E2718"],["Castanho","#6B4428"],["Castanho claro","#8E6440"],["Ruivo","#A8432A"],["Cobre","#C46A2E"],["Loiro mel","#C99A48"],["Loiro claro","#E6CC85"],["Grisalho","#9A958C"],["Branco","#EEECE6"],["Prata","#AEB6BF"],["Azul noite","#2E4C9A"],["Verde musgo","#3E7D4F"],["Roxo","#6B3FA0"],["Rosa","#D46A9A"],["Fogo","#E2582A"]],
  olhos:[["Castanhos","#5A3A22"],["Mel","#9A6A2A"],["Âmbar","#C88A1E"],["Verdes","#3E8A4F"],["Avelã","#7A7A3A"],["Azuis","#3D74C4"],["Azul-gelo","#8FB8D8"],["Cinzas","#7D8A96"],["Violeta","#8A4FC4"],["Vermelhos","#C4322A"],["Dourados","#E2B24F"],["Pretos","#1A1412"]],
  roupa:[["Musgo","#3F6B4A"],["Floresta","#2E4F38"],["Vinho","#7A2B33"],["Carmim","#A8322F"],["Azul real","#2F4D8A"],["Anil","#283A66"],["Couro","#7A5233"],["Areia","#C2A578"],["Grafite","#3E4650"],["Aço","#8C96A0"],["Roxo","#5B3F86"],["Ouro velho","#B08A2E"],["Linho","#E6DCC8"],["Preto","#1F1C1E"]],
  pintura:[["Vermelho","#B3261E"],["Azul","#2E5BB8"],["Branco","#F2F2F2"],["Preto","#151515"],["Dourado","#E2B24F"],["Verde","#2F8A4B"]],
  fundo:[["Feltro","#1F5C4A"],["Noite","#22304A"],["Pergaminho","#D9C9A3"],["Brasa","#7A3B22"],["Névoa","#A7B5B0"],["Lavanda","#8E7FB0"]]
};
const OPT={
  genero:[["fem","Feminino"],["masc","Masculino"],["neutro","Andrógino"]],
  idade:[["jovem","Jovem"],["adulto","Adulto"],["maduro","Maduro"],["idoso","Idoso"]],
  corpo:[["esguio","Esguio"],["medio","Médio"],["forte","Forte"]],
  cenario:[["floresta","Floresta"],["taverna","Taverna"],["masmorra","Masmorra"],["castelo","Castelo"],["noite","Noite estrelada"],["deserto","Deserto"],["neve","Montanhas"],["arcano","Plano arcano"],["liso","Cor sólida"]],
  aura:[["nenhuma","Sem aura"],["fogo","Fogo"],["gelo","Gelo"],["arcano","Arcana"],["sagrado","Sagrada"],["sombra","Sombras"],["natureza","Natureza"]],
  moldura:[["nenhuma","Sem moldura"],["ouro","Ouro"],["prata","Prata"],["madeira","Madeira"],["folhas","Folhas"],["runas","Runas"]],
  raca:[["humano","Humano"],["elfo","Elfo"],["anao","Anão"],["halfling","Halfling"],["orc","Orc"],["tiefling","Tiefling"],["goblin","Goblin"]],
  formato:[["oval","Oval"],["redondo","Redondo"],["quadrado","Quadrado"],["fino","Coração"],["longo","Longo"]],
  olhos:[["amendoados","Amendoados"],["redondos","Redondos"],["serios","Encapuzados"],["felinos","Puxados"],["caidos","Caídos"],["cansados","Cansados"],["fechados","Fechados"],["brilho","Brilho arcano"]],
  sobr:[["retas","Retas"],["arqueadas","Arqueadas"],["grossas","Grossas"],["bravas","Bravas"],["finas","Finas"],["preocupadas","Preocupadas"]],
  nariz:[["pequeno","Pequeno"],["reto","Reto"],["arrebitado","Arrebitado"],["largo","Largo"],["grande","Grande"],["adunco","Adunco"]],
  boca:[["neutra","Neutra"],["sorriso","Sorriso"],["canto","De canto"],["seria","Séria"],["dentes","Sorriso aberto"],["surpresa","Surpresa"],["gargalhada","Gargalhada"],["presas","Presas"]],
  marca:[["nenhuma","Nenhuma"],["cicatriz","Cicatriz no olho"],["bochecha","Corte na bochecha"],["sardas","Sardas"],["pinta","Pinta"],["tapaolho","Tapa-olho"],["tatuagem","Tatuagem"]],
  pintura:[["nenhuma","Sem pintura"],["listras","Listras"],["mascara","Máscara"],["runas","Runas"],["pontos","Pontos"]],
  maquiagem:[["nenhuma","Sem maquiagem"],["natural","Natural"],["delineado","Delineado"],["dramatica","Dramática"],["dourada","Dourada"]],
  cabelo:[["careca","Careca"],["raspado","Raspado"],["pixie","Pixie"],["curto","Curto"],["bagunca","Bagunçado"],["chanel","Chanel"],["franja","Franja"],["liso","Longo liso"],["ondulado","Ondulado"],["cacheado","Cacheado"],["volumoso","Black power"],["rabo","Rabo baixo"],["rabo_alto","Rabo alto"],["coque","Coque"],["meio_preso","Meio preso"],["trancas","Tranças"],["dreads","Dreads"],["moicano","Moicano"]],
  barba:[["nenhuma","Sem barba"],["porfazer","Por fazer"],["bigode","Bigode"],["bigodao","Bigodão"],["cavanhaque","Cavanhaque"],["curta","Curta"],["cheia","Cheia"],["longa","Longa trançada"]],
  chifres:[["nenhum","Nenhum"],["curvos","Curvos"],["carneiro","Carneiro"],["retos","Retos"],["galhada","Galhada"],["aureola","Auréola"]],
  roupa:[["tunica","Túnica"],["campones","Camponês"],["couro","Couro"],["malha","Cota de malha"],["placas","Placas"],["manto","Manto"],["mago","Vestes de mago"],["sacerdote","Sacerdotal"],["nobre","Nobre"],["peles","Peles"]],
  chapeu:[["nenhum","Nenhum"],["capuz","Capuz"],["mago","Chapéu de mago"],["bardo","Chapéu com pena"],["elmo","Elmo"],["viking","Elmo com chifres"],["coroa","Coroa"],["tiara","Tiara"],["bandana","Bandana"],["faixa","Faixa"]],
  rostoAcc:[["nenhum","Nenhum"],["argolas","Argolas"],["perolas","Pérolas"],["oculos","Óculos"],["monoculo","Monóculo"],["piercing","Piercing no nariz"],["sobrancelha","Piercing na sobrancelha"]],
  item:[["nenhum","Nenhum"],["espada","Espada"],["machado","Machado"],["martelo","Martelo"],["cajado","Cajado"],["varinha","Varinha"],["arco","Arco"],["adaga","Adagas"],["escudo","Escudo"],["alaude","Alaúde"],["livro","Grimório"],["tocha","Tocha"],["orbe","Orbe"]]
};
const VB={full:"0 0 200 240",head:"36 18 128 128",face:"58 76 84 66",torso:"0 136 200 104",top:"30 0 140 140"};
const LAYERS=[
  ["corpo","Corpo",[["o","genero","Gênero","head"],["o","idade","Idade","head"],["o","corpo","Compleição","torso"]]],
  ["raca","Raça",[["o","raca","Raça","head"],["c","pele","Tom de pele","pele"]]],
  ["rosto","Rosto",[["o","formato","Formato do rosto","head"],["o","olhos","Olhos","face"],["c","corOlhos","Cor dos olhos","olhos"],["o","sobr","Sobrancelhas","face"],["o","nariz","Nariz","face"],["o","boca","Boca e expressão","face"]]],
  ["cabelo","Cabelo",[["o","cabelo","Penteado","top"],["c","corCabelo","Cor do cabelo","cabelo"],["o","barba","Barba","head"]]],
  ["marcas","Marcas",[["o","maquiagem","Maquiagem","face"],["o","marca","Marca","face"],["o","pintura","Pintura de guerra","face"],["c","corPintura","Cor da pintura","pintura"]]],
  ["chifres","Chifres",[["o","chifres","Chifres e auréola","top"]]],
  ["roupa","Roupa",[["o","roupa","Roupa","torso"],["c","corRoupa","Cor principal","roupa"],["c","corDetalhe","Cor dos detalhes","roupa"]]],
  ["chapeu","Acessórios",[["o","chapeu","Na cabeça","top"],["c","corChapeu","Cor","roupa"],["o","rostoAcc","Brincos, óculos e piercings","head"]]],
  ["item","Item",[["o","item","Na mão","full"]]],
  ["cenario","Cenário",[["o","cenario","Cenário","full"],["c","corFundo","Cor do fundo (cor sólida)","fundo"],["o","aura","Aura","full"],["o","moldura","Moldura","full"]]]
];
const RACE_DEF={humano:{},elfo:{},anao:{},halfling:{formato:"redondo"},orc:{pele:"#7FA05A",boca:"presas"},tiefling:{pele:"#B54A3C",chifres:"curvos",corOlhos:"#E2B24F"},goblin:{pele:"#9DB860",olhos:"felinos"}};
const BASE={genero:"fem",idade:"adulto",corpo:"medio",cenario:"floresta",corFundo:"#1F5C4A",aura:"nenhuma",moldura:"ouro",raca:"humano",pele:"#E2A97F",formato:"oval",olhos:"amendoados",corOlhos:"#5A3A22",sobr:"arqueadas",nariz:"reto",boca:"neutra",marca:"nenhuma",pintura:"nenhuma",corPintura:"#B3261E",maquiagem:"nenhuma",cabelo:"liso",corCabelo:"#6B4428",barba:"nenhuma",chifres:"nenhum",roupa:"tunica",corRoupa:"#3F6B4A",corDetalhe:"#B08A2E",chapeu:"nenhum",corChapeu:"#7A2B33",rostoAcc:"nenhum",item:"nenhum"};
const PRESETS=[
  ["Guerreira",{genero:"fem",cenario:"castelo",pele:"#EFC7A6",formato:"oval",olhos:"serios",corOlhos:"#3D74C4",sobr:"retas",boca:"seria",marca:"bochecha",cabelo:"trancas",corCabelo:"#A8432A",roupa:"placas",corRoupa:"#8C96A0",corDetalhe:"#A8322F",item:"espada",moldura:"prata",corpo:"forte"}],
  ["Mago",{genero:"masc",idade:"idoso",cenario:"arcano",aura:"arcano",pele:"#F6DCC6",formato:"longo",olhos:"cansados",corOlhos:"#3D74C4",sobr:"grossas",nariz:"adunco",cabelo:"liso",corCabelo:"#EEECE6",barba:"longa",roupa:"mago",corRoupa:"#283A66",corDetalhe:"#E2B24F",chapeu:"mago",corChapeu:"#283A66",item:"cajado",corpo:"esguio"}],
  ["Ladina",{genero:"fem",idade:"jovem",cenario:"taverna",raca:"halfling",pele:"#C48E5C",formato:"redondo",olhos:"felinos",corOlhos:"#3E8A4F",sobr:"arqueadas",nariz:"arrebitado",boca:"canto",maquiagem:"delineado",cabelo:"pixie",corCabelo:"#1E1A18",roupa:"couro",corRoupa:"#3E4650",corDetalhe:"#7A5233",item:"adaga",moldura:"madeira",rostoAcc:"argolas"}],
  ["Clériga",{genero:"fem",cenario:"castelo",aura:"sagrado",pele:"#5E3820",olhos:"fechados",sobr:"arqueadas",nariz:"largo",boca:"sorriso",maquiagem:"dourada",cabelo:"coque",corCabelo:"#1E1A18",chifres:"aureola",roupa:"sacerdote",corRoupa:"#E6DCC8",corDetalhe:"#B08A2E",chapeu:"tiara",corChapeu:"#B08A2E",item:"escudo",rostoAcc:"perolas"}],
  ["Bardo",{genero:"masc",idade:"jovem",cenario:"taverna",raca:"elfo",pele:"#EFC7A6",formato:"fino",olhos:"amendoados",corOlhos:"#8A4FC4",sobr:"arqueadas",boca:"dentes",cabelo:"ondulado",corCabelo:"#E6CC85",roupa:"nobre",corRoupa:"#A8322F",corDetalhe:"#E2B24F",chapeu:"bardo",corChapeu:"#7A2B33",item:"alaude",moldura:"ouro"}],
  ["Patrulheira",{genero:"fem",cenario:"floresta",raca:"elfo",pele:"#E2A97F",formato:"fino",olhos:"amendoados",corOlhos:"#3E8A4F",sobr:"retas",boca:"neutra",marca:"cicatriz",cabelo:"liso",corCabelo:"#3E2718",roupa:"manto",corRoupa:"#2E4F38",corDetalhe:"#7A5233",chapeu:"capuz",corChapeu:"#2E4F38",item:"arco"}],
  ["Paladino",{genero:"masc",cenario:"castelo",aura:"sagrado",raca:"anao",pele:"#C48E5C",formato:"quadrado",olhos:"redondos",corOlhos:"#C88A1E",sobr:"grossas",nariz:"grande",boca:"seria",cabelo:"curto",corCabelo:"#C46A2E",barba:"longa",roupa:"placas",corRoupa:"#B08A2E",corDetalhe:"#2F4D8A",chapeu:"elmo",corChapeu:"#8C96A0",item:"martelo",moldura:"ouro",corpo:"forte"}],
  ["Druida",{genero:"neutro",cenario:"floresta",aura:"natureza",raca:"elfo",pele:"#7FA7D6",olhos:"brilho",corOlhos:"#3E8A4F",sobr:"finas",boca:"sorriso",cabelo:"cacheado",corCabelo:"#3E7D4F",chifres:"galhada",roupa:"manto",corRoupa:"#3F6B4A",corDetalhe:"#C2A578",item:"cajado",moldura:"folhas",pintura:"pontos",corPintura:"#F2F2F2"}],
  ["Bárbaro",{genero:"masc",cenario:"neve",raca:"orc",pele:"#7FA05A",formato:"quadrado",olhos:"serios",corOlhos:"#C4322A",sobr:"bravas",nariz:"largo",boca:"presas",marca:"cicatriz",cabelo:"moicano",corCabelo:"#1E1A18",barba:"cavanhaque",roupa:"peles",corRoupa:"#6B4428",corDetalhe:"#C2A578",item:"machado",pintura:"mascara",corPintura:"#B3261E",moldura:"madeira",corpo:"forte"}],
  ["Feiticeira",{genero:"fem",cenario:"noite",aura:"fogo",raca:"tiefling",pele:"#B54A3C",formato:"fino",olhos:"brilho",corOlhos:"#E2B24F",sobr:"arqueadas",boca:"canto",maquiagem:"dramatica",cabelo:"cacheado",corCabelo:"#1E1A18",chifres:"carneiro",roupa:"mago",corRoupa:"#1F1C1E",corDetalhe:"#A8322F",item:"orbe",moldura:"runas",rostoAcc:"argolas"}],
  ["Goblin",{genero:"neutro",cenario:"masmorra",raca:"goblin",pele:"#9DB860",formato:"redondo",olhos:"felinos",corOlhos:"#E2B24F",sobr:"bravas",nariz:"adunco",boca:"dentes",marca:"tapaolho",cabelo:"careca",roupa:"campones",corRoupa:"#7A5233",corDetalhe:"#3E4650",chapeu:"bandana",corChapeu:"#A8322F",item:"tocha",moldura:"nenhuma",corpo:"esguio"}],
  ["Viking anão",{genero:"masc",cenario:"neve",raca:"anao",pele:"#EFC7A6",formato:"redondo",olhos:"redondos",corOlhos:"#3D74C4",sobr:"grossas",nariz:"grande",boca:"gargalhada",cabelo:"trancas",corCabelo:"#E6CC85",barba:"longa",roupa:"malha",corRoupa:"#8C96A0",corDetalhe:"#2F4D8A",chapeu:"viking",corChapeu:"#8C96A0",item:"escudo",marca:"tatuagem",moldura:"prata",corpo:"forte"}],
  ["Rainha",{genero:"fem",idade:"maduro",cenario:"castelo",pele:"#F6DCC6",formato:"oval",olhos:"serios",corOlhos:"#7D8A96",sobr:"finas",nariz:"pequeno",boca:"canto",maquiagem:"natural",cabelo:"chanel",corCabelo:"#AEB6BF",roupa:"nobre",corRoupa:"#283A66",corDetalhe:"#E2B24F",chapeu:"coroa",corChapeu:"#A8322F",rostoAcc:"perolas",moldura:"ouro"}],
  ["Monge",{genero:"masc",cenario:"deserto",pele:"#A36B42",formato:"oval",olhos:"fechados",sobr:"retas",nariz:"reto",boca:"sorriso",cabelo:"careca",roupa:"tunica",corRoupa:"#C46A2E",corDetalhe:"#7A2B33",pintura:"runas",corPintura:"#E2B24F",moldura:"madeira",corpo:"esguio"}],
  ["Caçadora",{genero:"fem",cenario:"masmorra",raca:"orc",pele:"#7FA05A",formato:"quadrado",olhos:"felinos",corOlhos:"#C88A1E",sobr:"bravas",nariz:"largo",boca:"presas",cabelo:"dreads",corCabelo:"#1E1A18",roupa:"couro",corRoupa:"#1F1C1E",corDetalhe:"#A8322F",item:"adaga",rostoAcc:"sobrancelha",pintura:"listras",corPintura:"#F2F2F2",corpo:"forte"}],
  ["Alquimista",{genero:"masc",idade:"jovem",cenario:"taverna",pele:"#D9A066",formato:"fino",olhos:"redondos",corOlhos:"#9A6A2A",sobr:"preocupadas",nariz:"pequeno",boca:"surpresa",marca:"sardas",cabelo:"bagunca",corCabelo:"#8E6440",roupa:"mago",corRoupa:"#3F6B4A",corDetalhe:"#B08A2E",rostoAcc:"oculos",item:"livro",moldura:"madeira"}]
];
const STARS=[[18,22],[44,40],[70,14],[150,30],[176,58],[128,12],[30,80],[188,16],[96,8],[162,90],[10,120],[60,60]];
function sceneSvg(c,k){const id=s=>s+k;
  switch(c.cenario){
  case "floresta":return `<linearGradient id="${id("sky")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FD3B0"/><stop offset="1" stop-color="#2E5E44"/></linearGradient></defs><rect width="200" height="240" fill="url(#${id("sky")})"/><path d="M60 0L20 240M110 0L90 240M160 0L170 240" stroke="#FFF7D6" stroke-opacity=".18" stroke-width="18"/>${[[10,150,40],[48,130,34],[150,140,44],[186,120,30],[100,160,30]].map(([x,y,s])=>`<path d="M${x} ${y-s*2.4}L${x-s} ${y}H${x+s}Z" fill="#244C36"/><path d="M${x} ${y-s*1.6}L${x-s*1.2} ${y+s*.8}H${x+s*1.2}Z" fill="#1C3D2B"/>`).join("")}<rect y="200" width="200" height="40" fill="#1A3326"/>`;
  case "taverna":return `<linearGradient id="${id("w")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6B4428"/><stop offset="1" stop-color="#3A2416"/></linearGradient><radialGradient id="${id("g")}" cx=".75" cy=".3" r=".6"><stop offset="0" stop-color="#FFC266" stop-opacity=".7"/><stop offset="1" stop-color="#FFC266" stop-opacity="0"/></radialGradient></defs><rect width="200" height="240" fill="url(#${id("w")})"/><path d="M0 40H200M0 120H200M40 0V240M160 0V240" stroke="#2A190E" stroke-width="7"/><rect x="128" y="50" width="44" height="54" rx="4" fill="#FFD27A" opacity=".8"/><path d="M150 50V104M128 77H172" stroke="#2A190E" stroke-width="4"/><rect width="200" height="240" fill="url(#${id("g")})"/><rect x="18" y="60" width="6" height="18" fill="#EDE3C8"/><path d="M21 52q4 4 0 8q-4-4 0-8z" fill="#FFB347"/>`;
  case "masmorra":return `<radialGradient id="${id("g")}" cx=".15" cy=".35" r=".7"><stop offset="0" stop-color="#E2582A" stop-opacity=".55"/><stop offset="1" stop-color="#E2582A" stop-opacity="0"/></radialGradient></defs><rect width="200" height="240" fill="#2B2D33"/>${Array.from({length:8},(_,r)=>Array.from({length:5},(_,cI)=>`<rect x="${cI*44-(r%2)*22+2}" y="${r*30+2}" width="40" height="26" rx="3" fill="${["#3A3D45","#34373E","#41444C"][(r+cI)%3]}"/>`).join("")).join("")}<rect width="200" height="240" fill="url(#${id("g")})"/><rect x="22" y="80" width="6" height="26" fill="#5A3A22"/><path d="M25 62q9 10 0 20q-9-10 0-20z" fill="#FFB347"/>`;
  case "castelo":return `<linearGradient id="${id("sky")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FB2E5"/><stop offset="1" stop-color="#F2D6A8"/></linearGradient></defs><rect width="200" height="240" fill="url(#${id("sky")})"/><circle cx="160" cy="40" r="16" fill="#FFF3C4"/><path d="M0 170V120h14v-12h10v12h14v-30h10v-12h10v12h10v30h80v-40h10v-12h10v12h10v40h22v50z" fill="#5B6577" opacity=".85"/><path d="M48 66v-24l16 7-16 7" fill="#A8322F"/><path d="M158 78v-22l14 6-14 6" fill="#2F4D8A"/><rect y="170" width="200" height="70" fill="#6E8B5B"/>`;
  case "noite":return `<linearGradient id="${id("sky")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0E1530"/><stop offset="1" stop-color="#2F3E73"/></linearGradient></defs><rect width="200" height="240" fill="url(#${id("sky")})"/>${STARS.map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="${i%3?1.2:2}" fill="#FFF" opacity="${i%2?.6:.95}"/>`).join("")}<circle cx="156" cy="44" r="18" fill="#F4F1DE"/><circle cx="164" cy="38" r="16" fill="#1B2550"/><path d="M0 200Q50 170 100 196T200 186V240H0Z" fill="#151C3A"/>`;
  case "deserto":return `<linearGradient id="${id("sky")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6B26B"/><stop offset="1" stop-color="#F9E0B0"/></linearGradient></defs><rect width="200" height="240" fill="url(#${id("sky")})"/><circle cx="46" cy="60" r="24" fill="#FFF0C2"/><path d="M0 170Q60 140 120 170T200 160V240H0Z" fill="#D9A55B"/><path d="M0 200Q80 176 200 206V240H0Z" fill="#C48A3E"/>`;
  case "neve":return `<linearGradient id="${id("sky")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFD6E8"/><stop offset="1" stop-color="#EEF4F8"/></linearGradient></defs><rect width="200" height="240" fill="url(#${id("sky")})"/><path d="M-10 190L50 90L90 150L130 70L210 190Z" fill="#8FA6BA"/><path d="M50 90L38 110L50 106L60 112ZM130 70L114 98L130 92L144 100Z" fill="#FFF"/>${STARS.map(([x,y])=>`<circle cx="${x}" cy="${y+30}" r="1.8" fill="#FFF"/>`).join("")}<rect y="190" width="200" height="50" fill="#F4F8FB"/>`;
  case "arcano":return `<radialGradient id="${id("g")}" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#8E5CE0"/><stop offset="1" stop-color="#1E1240"/></radialGradient></defs><rect width="200" height="240" fill="url(#${id("g")})"/><circle cx="100" cy="96" r="80" fill="none" stroke="#C9A8FF" stroke-opacity=".35" stroke-width="2"/><circle cx="100" cy="96" r="64" fill="none" stroke="#C9A8FF" stroke-opacity=".25" stroke-dasharray="4 6" stroke-width="2"/><path d="M100 16L169 136H31Z" fill="none" stroke="#C9A8FF" stroke-opacity=".25" stroke-width="2"/>`;
  default:return `</defs><rect width="200" height="240" fill="${c.corFundo}"/>`;}
}
function auraSvg(c,k){const A={fogo:["#FF7A2A","#FFD27A"],gelo:["#7FD3FF","#E8F8FF"],arcano:["#B47CFF","#E6D4FF"],sagrado:["#FFE08A","#FFF8DC"],sombra:["#1A1024","#3A2A4A"],natureza:["#5FCF7A","#D8F5C4"]}[c.aura];if(!A)return "";
  const g=`<radialGradient id="au${k}" cx=".5" cy=".55" r=".55"><stop offset="0" stop-color="${A[0]}" stop-opacity=".85"/><stop offset=".6" stop-color="${A[0]}" stop-opacity=".35"/><stop offset="1" stop-color="${A[0]}" stop-opacity="0"/></radialGradient>`;
  let extra="";
  if(c.aura==="fogo")extra=[[30,240,30],[70,240,44],[130,240,40],[172,240,28]].map(([x,y,h])=>`<path d="M${x-14} ${y}Q${x-12} ${y-h*.6} ${x} ${y-h}Q${x+12} ${y-h*.6} ${x+14} ${y}Z" fill="${A[1]}" opacity=".75"/>`).join("");
  if(c.aura==="gelo")extra=[[24,170],[176,150],[40,90],[164,70]].map(([x,y])=>`<path d="M${x} ${y-10}L${x+5} ${y}L${x} ${y+10}L${x-5} ${y}Z" fill="${A[1]}"/>`).join("");
  if(c.aura==="arcano"||c.aura==="natureza")extra=STARS.slice(0,9).map(([x,y],i)=>`<circle cx="${(x*1.1)%200}" cy="${60+(y*2.3)%150}" r="${i%2?2:3}" fill="${A[1]}" opacity=".9"/>`).join("");
  if(c.aura==="sagrado")extra=Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return `<path d="M100 100L${100+Math.cos(a)*140} ${100+Math.sin(a)*140}" stroke="${A[1]}" stroke-opacity=".35" stroke-width="8"/>`}).join("");
  if(c.aura==="sombra")extra=`<path d="M0 240Q30 150 60 200T120 170T200 200V240Z" fill="#1A1024" opacity=".8"/>`;
  return {defs:g,body:`<ellipse cx="100" cy="130" rx="96" ry="112" fill="url(#au${k})"/>${extra}`};
}
const RIM={floresta:"#CFF5C8",taverna:"#FFC266",masmorra:"#FF8A4A",castelo:"#EFE6CF",noite:"#9DB8FF",deserto:"#FFD49A",neve:"#DDEBFF",arcano:"#D7B8FF",liso:"#FFFFFF"};
const RIM_AURA={fogo:"#FFB060",gelo:"#BFEAFF",arcano:"#D7B8FF",sagrado:"#FFF0B0",sombra:"#8A70B0",natureza:"#B8F0A8"};
const FACE={oval:[33,27,146,9],redondo:[36,32,142,14],quadrado:[34,33,145,16],fino:[34,22,146,6],longo:[31,26,152,10]};
const EYE={amendoados:{w:8.6,up:5.4,lo:3.4,tilt:-.8},redondos:{w:8,up:6.6,lo:4.6,tilt:0},serios:{w:8.6,up:3.8,lo:3,tilt:-.4,hood:1},felinos:{w:9,up:4.8,lo:2.8,tilt:-2.8},caidos:{w:8.6,up:5,lo:3.4,tilt:2.2},cansados:{w:8.4,up:4.2,lo:3.4,tilt:.8,bags:1},fechados:{w:8.6,up:5,lo:3.4,tilt:0,closed:1},brilho:{w:8.6,up:5.4,lo:3.4,tilt:-.8,glow:1}};
const BROW={retas:[[96,88],[86,86.2],[76,87.5],0],arqueadas:[[96,88.5],[84,83],[75.5,88],0],grossas:[[96.5,88],[86,85.5],[75,87.5],2.2],bravas:[[96,91.5],[86,87],[76,84.5],.6],finas:[[95.5,88],[84.5,83.5],[76,87.8],-1.1],preocupadas:[[96,85.5],[86,86.5],[76,90],0]};
const NOSE={pequeno:{w:5.8,t:114},reto:{w:7,t:116},arrebitado:{w:6.4,t:113.5,up:1},largo:{w:9.8,t:116},grande:{w:9,t:118.5},adunco:{w:7.4,t:118.5,hook:1}};
const MOUTH={neutra:{mw:12,l:0,r:0},sorriso:{mw:13.5,l:-3.6,r:-3.6},canto:{mw:12.5,l:.6,r:-3.4},seria:{mw:11.5,l:2,r:2},presas:{mw:12.5,l:0,r:0},dentes:{mw:14,l:-3,r:-3,open:6},surpresa:{mw:6,l:0,r:0,open:7},gargalhada:{mw:15,l:-4,r:-4,open:11}};
function bz(a,b,c,d,t){const u=1-t;return [u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*d[0],u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*d[1]]}
const f1=n=>Math.round(n*10)/10;

function hairSvg(c,k,g){
  const {cw,T,hc,hd,hl}=g,L=100-cw,R=100+cw,id=s=>s+k,fillH=`url(#hr${k})`;
  const dome=v=>`M${L-v} ${T+44}C${L-v-1} ${T+8} ${100-cw*.55} ${T-v-6} 100 ${T-v-6}C${100+cw*.55} ${T-v-6} ${R+v+1} ${T+8} ${R+v} ${T+44}`;
  const lineSide=`L${R-1} ${T+40}C${R-2} ${T+20} 113 ${T+10} 95 ${T+9}C83 ${T+12} ${L+2} ${T+22} ${L+1} ${T+40}Z`;
  const lineSwept=`L${R-1} ${T+38}C${R-3} ${T+18} 112 ${T+10} 100 ${T+12}C90 ${T+16} ${L+8} ${T+26} ${L+2} ${T+36}Z`;
  const lineCenter=`L${R-1} ${T+40}C${R-3} ${T+18} 106 ${T+8} 100 ${T+12}C94 ${T+8} ${L+3} ${T+18} ${L+1} ${T+40}Z`;
  const lineSlick=`L${R-1} ${T+36}C${R-4} ${T+14} 112 ${T+6} 100 ${T+6}C88 ${T+6} ${L+4} ${T+14} ${L+1} ${T+36}Z`;
  const lineNatural=`L${R-1} ${T+40}C${R-1} ${T+26} ${R-6} ${T+16} ${R-12} ${T+14}C112 ${T+10} 88 ${T+10} ${L+12} ${T+14}C${L+6} ${T+16} ${L+1} ${T+26} ${L+1} ${T+40}Z`;
  const bangs=()=>{let p=`L${R+1} ${T+44}C${R} ${T+36} ${R-3} ${T+30} ${R-6} ${T+29}`;for(let i=1;i<=8;i++){const x=R-6-(2*cw-12)*i/8;p+=`L${f1(x)} ${i%2?T+26.5:T+29.5}`}return p+`C${L+3} ${T+30} ${L} ${T+36} ${L-1} ${T+44}Z`};
  const tex=(d,n,y0,y1,spread,wav=0)=>{let s=`<clipPath id="${id("t"+(++g.ti))}"><path d="${d}"/></clipPath><g clip-path="url(#${id("t"+g.ti)})" fill="none" stroke-linecap="round">`;
    for(let i=0;i<n;i++){const t=n<2?.5:i/(n-1),x=100+(t-.5)*2*spread;s+=`<path d="M${f1(100+(x-100)*.25)} ${y0}Q${f1(x+(x-100)*.35+(i%3-1)*wav)} ${f1((y0+y1)/2-8)} ${f1(x+(x-100)*.1)} ${y1}" stroke="${i%2?hd:hl}" stroke-opacity="${i%2?.45:.4}" stroke-width="${i%3?.8:1.2}"/>`}
    return s+`<ellipse cx="${100-cw*.25}" cy="${T+4}" rx="${cw*.55}" ry="6" fill="${hl}" opacity=".45" filter="url(#bl${k})"/></g>`};
  const shape=(d,n=22,y0=T-12,y1=T+50,sp=cw+12,wav=0)=>`<path d="${d}" fill="${fillH}" stroke="${hd}" stroke-width=".7" stroke-opacity=".6"/>`+tex(d,n,y0,y1,sp,wav);
  const longBack=(len,v=9)=>`M${L-v} ${T+40}C${L-v-2} ${T-2} ${100-cw*.5} ${T-12} 100 ${T-12}C${100+cw*.5} ${T-12} ${R+v+2} ${T-2} ${R+v} ${T+40}L${R+v+6} ${T+len}Q100 ${T+len+6} ${L-v-6} ${T+len}Z`;
  const wavyBack=len=>{let p=`M${L-9} ${T+40}C${L-11} ${T-2} ${100-cw*.5} ${T-12} 100 ${T-12}C${100+cw*.5} ${T-12} ${R+11} ${T-2} ${R+9} ${T+40}`;for(let i=1;i<=5;i++)p+=`Q${R+(i%2?22:4)} ${T+40+i*len/5-len/10} ${R+12} ${T+40+i*len/5}`;p+=`Q100 ${T+44+len} ${L-12} ${T+40+len}`;for(let i=4;i>=0;i--)p+=`Q${L-(i%2?4:22)} ${T+40+i*len/5+len/10} ${L-(i?12:9)} ${T+40+i*len/5}`;return p+"Z"};
  const sidePanel=(len,flare=6)=>{const d=`M${L+2} ${T+12}C${L-8} ${T+28} ${L-flare-6} ${f1(T+len*.6)} ${L-4} ${T+len}L${L+1} ${T+len-7}L${L+5} ${T+len-1}C${L+6} ${T+len-40} ${L+4} ${T+60} ${L+7} ${T+36}C${L+9} ${T+26} ${L+8} ${T+18} ${L+2} ${T+12}Z`;const one=`<path d="${d}" fill="#000" opacity=".28" transform="translate(2.5 1)" filter="url(#bl${k})"/>`+shape(d,6,T+12,T+len,12);return one+`<g transform="translate(200 0) scale(-1 1)">${one}</g>`};
  const curls=(pts,r)=>pts.map(([x,y],i)=>`<circle cx="${f1(x)}" cy="${f1(y)}" r="${r+(i%3)*1.2}" fill="${fillH}" stroke="${hd}" stroke-width=".8"/><path d="M${f1(x-r*.5)} ${f1(y-r*.1)}a${r*.5} ${r*.5} 0 0 1 ${r*.8} ${-r*.3}" stroke="${hl}" stroke-opacity=".6" fill="none"/>`).join("");
  const ring=(n,rx,ry,cy,a0,a1)=>Array.from({length:n},(_,i)=>{const a=(a0+(a1-a0)*i/(n-1))*Math.PI/180;return [100+Math.cos(a)*rx,cy+Math.sin(a)*ry]});
  let back="",front="",over="";
  switch(c.cabelo){
  case "careca":front=`<ellipse cx="90" cy="${T+12}" rx="11" ry="6" fill="#fff" opacity=".22" filter="url(#bl${k})"/>`;break;
  case "raspado":front=`<path d="${dome(0)}${lineNatural}" fill="${hc}" opacity=".42"/>`+tex(dome(0)+lineNatural,26,T-6,T+44,cw+8);break;
  case "pixie":back=`<path d="${dome(3)}L${R+2} ${T+58}Q100 ${T+62} ${L-2} ${T+58}Z" fill="${hd}"/>`;front=shape(dome(3)+lineSwept,20)+shape(`M${L+1} ${T+30}C${L+6} ${T+14} 98 ${T+8} 112 ${T+12}C100 ${T+18} ${L+12} ${T+30} ${L+4} ${T+42}Z`,6,T+8,T+42,16);break;
  case "curto":back=`<path d="${dome(3)}L${R+2} ${T+52}H${L-2}Z" fill="${hd}"/>`;front=shape(dome(3)+lineNatural,24);break;
  case "bagunca":{let p=`M${L-3} ${T+46}`;const sp=[[L-8,T+16],[L+2,T+14],[L-2,T-4],[L+14,T+2],[88,T-16],[98,T-2],[108,T-18],[114,T],[R-6,T-8],[R-2,T+10],[R+10,T+12],[R+4,T+26]];sp.forEach(([x,y],i)=>p+=`L${f1(x)} ${f1(y)}`);p+=`L${R+3} ${T+46}`+lineNatural;back=`<path d="${dome(4)}L${R+2} ${T+54}H${L-2}Z" fill="${hd}"/>`;front=shape(p,24,T-18,T+46,cw+14);break}
  case "chanel":back=`<path d="M${L-9} ${T+40}C${L-11} ${T-2} ${100-cw*.5} ${T-12} 100 ${T-12}C${100+cw*.5} ${T-12} ${R+11} ${T-2} ${R+9} ${T+40}L${R+8} ${T+80}Q100 ${T+86} ${L-8} ${T+80}Z" fill="${hd}"/>`;front=shape(dome(5)+lineSide,22)+sidePanel(80,4);break;
  case "franja":back=`<path d="${longBack(120)}" fill="${hd}"/>`;front=shape(dome(5)+bangs(),26,T-10,T+30,cw+10)+sidePanel(110,8);break;
  case "liso":back=`<path d="${longBack(140)}" fill="${hd}"/>`;front=shape(dome(5)+lineSide,24)+sidePanel(140,8);break;
  case "ondulado":back=`<path d="${wavyBack(120)}" fill="${hd}"/>`;front=shape(dome(6)+lineSide,24,T-12,T+50,cw+12,6)+sidePanel(118,14);break;
  case "meio_preso":back=`<path d="${longBack(130,7)}" fill="${hd}"/><circle cx="100" cy="${T-8}" r="9" fill="${fillH}" stroke="${hd}"/>`;front=shape(dome(4)+lineSlick,22)+sidePanel(128,6);break;
  case "cacheado":back=curls(ring(13,cw+14,64,T+46,170,370).concat(ring(6,cw+16,30,T+104,190,350).map(([x,y])=>[x,y+8])).filter(([x,y])=>y<T+136),11)+`<path d="${longBack(90,12)}" fill="${hd}"/>`;front=curls(ring(11,cw+4,30,T+28,190,350),7.5);break;
  case "volumoso":back=`<circle cx="100" cy="${T+30}" r="${cw+28}" fill="${fillH}" stroke="${hd}"/>`+curls(ring(16,cw+26,cw+26,T+30,0,337.5),6);front=shape(dome(3)+lineNatural,18);break;
  case "rabo":front=shape(dome(2)+lineSlick,20);over=shape(`M${R-3} ${T+56}C${R+14} ${T+76} ${R+14} ${T+118} ${R+4} ${T+152}C${R-2} ${T+124} ${R+2} ${T+92} ${R-9} ${T+72}Z`,6,T+56,T+152,12)+`<path d="M${R-6} ${T+60}l9 6" stroke="${c.corDetalhe}" stroke-width="4" stroke-linecap="round"/>`;break;
  case "rabo_alto":back=shape(`M${100+cw*.45} ${T}C${R+30} ${T-6} ${R+28} ${T+60} ${R+16} ${T+116}C${R+8} ${T+76} ${R+12} ${T+30} ${100+cw*.2} ${T+10}Z`,6,T-4,T+116,18);front=shape(dome(2)+lineSlick,20)+`<ellipse cx="${100+cw*.5}" cy="${T-3}" rx="5" ry="3.5" fill="${c.corDetalhe}" transform="rotate(30 ${100+cw*.5} ${T-3})"/>`;break;
  case "coque":front=shape(dome(2)+lineSlick,20)+`<circle cx="100" cy="${T-10}" r="14" fill="${fillH}" stroke="${hd}"/><path d="M90 ${T-14}q10-8 20 0M92 ${T-6}q8 5 16 0" stroke="${hl}" stroke-opacity=".7" fill="none"/>`;break;
  case "trancas":{const braid=x=>Array.from({length:7},(_,i)=>`<ellipse cx="${f1(x+(i%2?1.6:-1.6))}" cy="${T+70+i*11}" rx="${6.5-i*.25}" ry="7" fill="${fillH}" stroke="${hd}"/><path d="M${f1(x-4)} ${T+68+i*11}q4 4 8 0" stroke="${hl}" stroke-opacity=".5" fill="none"/>`).join("")+`<path d="M${x-4} ${T+148}h8" stroke="${c.corDetalhe}" stroke-width="4"/><path d="M${x-3} ${T+151}l-2 8M${x} ${T+151}v9M${x+3} ${T+151}l2 8" stroke="${hd}" stroke-width="2"/>`;
    front=shape(dome(3)+lineCenter,22)+`<path d="M100 ${T+12}V${T-8}" stroke="${hd}" stroke-width="1"/>`;over=braid(L-1)+braid(R+1);break}
  case "dreads":{const locs=[];for(let i=0;i<11;i++){const x=L-10+(2*cw+20)*i/10,len=T+118+(i%3)*12;locs.push(`<path d="M${f1(x)} ${T+20}C${f1(x-2)} ${T+60} ${f1(x+2)} ${len-30} ${f1(x)} ${len}" stroke="${i%2?hd:hc}" stroke-width="7" stroke-linecap="round" fill="none"/>`)}
    back=`<path d="${longBack(70,10)}" fill="${hd}"/>`+locs.join("");front=shape(dome(5)+lineNatural,16)+[L-2,L+6,R-6,R+2].map((x,i)=>`<path d="M${x} ${T+30}C${x-2} ${T+60} ${x+(i<2?-3:3)} ${T+90} ${x} ${T+112}" stroke="${fillH}" stroke-width="6.5" stroke-linecap="round" fill="none"/><path d="M${x} ${T+40}v60" stroke="${hl}" stroke-opacity=".35" stroke-dasharray="2 3"/>`).join("");break}
  case "moicano":front=`<path d="${dome(0)}${lineNatural}" fill="${hc}" opacity=".3"/>`+shape(`M90 ${T+14}Q90 ${T-30} 100 ${T-40}Q110 ${T-30} 110 ${T+14}Q106 ${T+34} 100 ${T+36}Q94 ${T+34} 90 ${T+14}Z`,7,T-40,T+36,12);break;
  }
  return {back,front,over};
}

function avatarSvg(cfg,size,title,mode,key){
  const c={...BASE,...cfg},k=key,id=s=>s+k;
  const gF=c.genero==="fem",gM=c.genero==="masc",young=c.idade==="jovem",mature=c.idade==="maduro"||c.idade==="idoso",old=c.idade==="idoso";
  const skin=c.pele,sk1=sh(skin,-14),sk2=sh(skin,-30),sk3=sh(skin,-50),skL=sh(skin,24),hc=c.corCabelo,hd=sh(hc,-38),hl=sh(hc,32),rc=c.corRoupa,rd=sh(rc,-30),rl=sh(rc,25),dc=c.corDetalhe,ink="#24160F";
  const mk=c.maquiagem,rim=RIM_AURA[c.aura]||RIM[c.cenario]||"#fff";
  /* proporções */
  let [cheek,jaw,chinY,chinW]=FACE[c.formato]||FACE.oval;
  if(gM){jaw+=3;chinW+=3}if(gF){jaw-=2;chinW-=2;chinY-=2}if(young){cheek+=1;chinY-=2}if(old)jaw+=1;
  const RX={anao:[2,3,0,2],goblin:[1,-3,-2,-1],orc:[1,4,0,3],halfling:[1,0,-3,1]}[c.raca];if(RX){cheek+=RX[0];jaw+=RX[1];chinY+=RX[2];chinW+=RX[3]}
  const T=c.raca==="anao"?58:56,cw=cheek+1;
  let sw=(gF?72:gM?84:78)+({forte:10,esguio:-8}[c.corpo]||0)+({anao:8,halfling:-6,goblin:-10,orc:6}[c.raca]||0);
  let nw=(gF?12:gM?16:14)+({forte:3,esguio:-1.5}[c.corpo]||0)+({orc:3,goblin:-2}[c.raca]||0);
  const headD=`M100 ${T}C${100+cheek*.62} ${T} ${100+cw} ${T+13} ${100+cw} ${T+34}C${100+cw} ${T+48} ${100+jaw+4} ${T+60} ${100+jaw} ${T+72}C${100+jaw-3} ${chinY-10} ${100+chinW+7} ${chinY-.5} ${100+chinW} ${chinY}Q100 ${chinY+2.5} ${100-chinW} ${chinY}C${100-chinW-7} ${chinY-.5} ${100-jaw+3} ${chinY-10} ${100-jaw} ${T+72}C${100-jaw-4} ${T+60} ${100-cw} ${T+48} ${100-cw} ${T+34}C${100-cw} ${T+13} ${100-cheek*.62} ${T} 100 ${T}Z`;
  const mirror=d=>`<g transform="translate(200 0) scale(-1 1)">${d}</g>`;
  const blur=`filter="url(#bl${k})"`,blur1=`filter="url(#bs${k})"`;
  /* orelhas */
  const ear=d=>`<path d="${d}" fill="url(#ea${k})" stroke="${sk2}" stroke-width="1"/>`;
  const E={humano:`<path d="M68 94C60 88 56 100 59 109C60 115 64 118 68 116Z" fill="url(#ea${k})" stroke="${sk2}"/><path d="M66 98C61 97 60 105 63 110" stroke="${sk3}" stroke-opacity=".5" fill="none"/>`,
    elfo:ear("M68 94L38 72Q52 96 66 120Z")+`<path d="M62 100L47 84" stroke="${sk3}" stroke-opacity=".45"/>`,anao:`<path d="M68 96C60 90 56 104 60 112C62 117 66 118 68 116Z" fill="url(#ea${k})" stroke="${sk2}"/>`,
    halfling:ear("M68 96L52 82Q58 104 66 116Z"),orc:ear("M68 96L50 88Q56 106 66 116Z"),tiefling:ear("M68 96L48 84Q56 106 66 118Z"),goblin:ear("M68 94L14 76Q40 100 66 122Z")+`<path d="M60 100L28 84" stroke="${sk3}" stroke-opacity=".45"/>`}[c.raca]||"";
  const earsG=`<g transform="translate(${100-cw-67} 0)">${E}</g>`;
  const ears=earsG+mirror(earsG);
  /* olhos */
  const ex=87,ey=99,P={...(EYE[c.olhos]||EYE.amendoados)};if(young){P.w*=1.05;P.up+=.4}if(gF)P.up+=.3;
  const {w,up,lo,tilt}=P,O=[ex-w,ey+tilt],IC=[ex+w,ey+.6],U1=[ex-w*.45,ey-up],U2=[ex+w*.35,ey-up],L1=[ex+w*.4,ey+lo],L2=[ex-w*.5,ey+lo];
  const upperD=`M${f1(O[0])} ${f1(O[1])}C${f1(U1[0])} ${f1(U1[1])} ${f1(U2[0])} ${f1(U2[1])} ${f1(IC[0])} ${f1(IC[1])}`;
  const scleraD=upperD+`C${f1(L1[0])} ${f1(L1[1])} ${f1(L2[0])} ${f1(L2[1])} ${f1(O[0])} ${f1(O[1])}Z`;
  const lashes=gF||mk==="delineado"||mk==="dramatica";
  const socketC=mk==="dramatica"?"#3A2236":mk==="dourada"?"#E2B24F":sk2,socketO=mk==="dramatica"?.6:mk==="dourada"?.55:mature?.32:.22;
  let eye=`<ellipse cx="${ex}" cy="${ey-2}" rx="${f1(w+3.5)}" ry="${f1(up+4)}" fill="${socketC}" opacity="${socketO}" ${blur}/>`;
  if(P.closed){
    eye+=`<path d="M${f1(O[0])} ${f1(O[1])}Q${ex} ${ey+4} ${f1(IC[0])} ${f1(IC[1])}" stroke="${ink}" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M${f1(O[0]+1)} ${f1(O[1]-2.5)}Q${ex} ${ey-3} ${f1(IC[0]-1)} ${f1(IC[1]-2.5)}" stroke="${sk3}" stroke-opacity=".5" fill="none"/>`;
    if(lashes)eye+=[.15,.3,.45].map(t=>{const x=ex-w+2*w*t,y=ey+2.6*Math.sin(Math.PI*t)+tilt*(1-t);return `<path d="M${f1(x)} ${f1(y)}l${-1.2} 2.4" stroke="${ink}" stroke-width=".9" stroke-linecap="round"/>`}).join("");
  }else{
    const ir=4.2*(w/8.6);
    eye+=`<path d="${scleraD}" fill="${P.glow?c.corOlhos:`url(#eb${k})`}"/><g clip-path="url(#ec${k})">`+
      (P.glow?`<ellipse cx="${ex}" cy="${ey}" rx="${w}" ry="${up}" fill="#FFFDF0" opacity=".65" ${blur1}/>`:
      `<circle cx="${ex+.5}" cy="${ey+.3}" r="${f1(ir)}" fill="url(#ir${k})"/><circle cx="${ex+.5}" cy="${ey+.3}" r="${f1(ir*.42)}" fill="#0E0A09"/>`)+
      `<path d="${upperD}" stroke="${sk3}" stroke-width="3" stroke-opacity=".45" fill="none" ${blur1}/></g>`+
      `<path d="M${f1(IC[0]-1.2)} ${f1(IC[1])}a1.4 1.1 0 1 0 .1 0" fill="#D98C8C" opacity=".55"/>`;
    eye+=`<path d="${upperD}" stroke="${ink}" stroke-width="${lashes?1.9:1.3}" fill="none" stroke-linecap="round"/>`;
    eye+=`<path d="M${f1(O[0]+1)} ${f1(O[1]-1.6)}C${f1(ex-w*.4)} ${f1(ey-up-(P.hood?1:3.4))} ${f1(ex+w*.3)} ${f1(ey-up-(P.hood?1:3.2))} ${f1(IC[0]-1)} ${f1(IC[1]-2.4)}" stroke="${sk3}" stroke-width="${P.hood?1.6:1}" stroke-opacity=".55" fill="none"/>`;
    eye+=`<path d="M${f1(O[0]+1.5)} ${f1(O[1]+.6)}C${f1(ex-w*.4)} ${f1(ey+lo+.8)} ${f1(ex+w*.4)} ${f1(ey+lo+.6)} ${f1(IC[0]-1)} ${f1(IC[1]+.3)}" stroke="${sk3}" stroke-width=".9" stroke-opacity=".45" fill="none"/>`;
    if(lashes)eye+=[.06,.16,.27,.38].map((t,i)=>{const [x,y]=bz(O,U1,U2,IC,t);return `<path d="M${f1(x)} ${f1(y)}q${-1.4-i*.1} -1 ${-1.8-(3-i)*.4} -2.8" stroke="${ink}" stroke-width=".9" fill="none" stroke-linecap="round"/>`}).join("");
  }
  if(mk==="delineado"||mk==="dramatica")eye+=`<path d="M${f1(O[0]+3)} ${f1(O[1]-.8)}L${f1(O[0]-4.5)} ${f1(O[1]-4.2)}L${f1(O[0]+1)} ${f1(O[1]+.4)}Z" fill="${ink}"/>`;
  if(P.bags||old)eye+=`<path d="M${f1(ex-w+2)} ${f1(ey+lo+3)}Q${ex} ${f1(ey+lo+6.5)} ${f1(ex+w-1)} ${f1(ey+lo+2.4)}" stroke="${sk3}" stroke-opacity=".35" fill="none"/>`;
  if(mature)eye+=`<path d="M${f1(O[0]-1.5)} ${f1(O[1]+.5)}l-4 -1.6M${f1(O[0]-1.5)} ${f1(O[1]+2)}l-3.6 1.4" stroke="${sk3}" stroke-opacity="${old?.45:.28}" stroke-width=".8"/>`;
  const catch_=P.closed?"":[ex,200-ex].map(x=>`<circle cx="${x+1.9}" cy="${ey-1.4}" r="1.15" fill="#fff"/><circle cx="${x-1.2}" cy="${ey+1.6}" r=".55" fill="#fff" opacity=".7"/>`).join("");
  const glow=P.glow?[ex,200-ex].map(x=>`<circle cx="${x}" cy="${ey}" r="11" fill="${c.corOlhos}" opacity=".45" ${blur}/>`).join(""):"";
  const eyes=glow+eye+mirror(eye)+catch_;
  /* sobrancelhas */
  const B=BROW[c.sobr]||BROW.retas;let bt=(gF?2.4:gM?3.8:3)+B[3]-(old?.4:0);bt=Math.max(1.2,bt);
  const [bi,ba,bo]=B,bcol=sh(hc,c.corCabelo==="#EEECE6"||c.corCabelo==="#E6CC85"?-20:-12);
  const brow=`<path d="M${bi[0]} ${f1(bi[1]-bt*.55)}Q${ba[0]} ${f1(ba[1]-bt*.65)} ${bo[0]} ${bo[1]-.2}Q${ba[0]} ${f1(ba[1]+bt*.45)} ${bi[0]} ${f1(bi[1]+bt*.5)}Q${bi[0]+.8} ${bi[1]} ${bi[0]} ${f1(bi[1]-bt*.55)}Z" fill="${bcol}" opacity=".92"/><path d="M${bi[0]-1} ${bi[1]}Q${ba[0]} ${ba[1]-bt*.1} ${bo[0]+2} ${bo[1]}" stroke="${sh(bcol,20)}" stroke-opacity=".4" stroke-width=".6" fill="none" stroke-dasharray="1 1.4"/>`;
  const brows=brow+mirror(brow);
  /* nariz */
  const NP={...(NOSE[c.nariz]||NOSE.reto)};if(gM){NP.w+=.6;NP.t+=1}const nw2=NP.w,nt=NP.t;
  const noseSide=`<path d="M102.6 92C104.2 102 106 ${nt-6} ${f1(100+nw2*.85)} ${nt-1}L${f1(100+nw2*.4)} ${nt+1}C103 ${nt-6} 101.6 100 100.6 92Z" fill="${sk2}" opacity=".5" ${blur1}/>`;
  const nose=noseSide+`<g opacity=".35">${mirror(noseSide)}</g><path d="M99.2 95V${nt-4}" stroke="${skL}" stroke-width="2.2" opacity=".5" stroke-linecap="round" ${blur1}/>`+
    (NP.hook?`<path d="M100.4 102Q103.6 107 102.4 112" stroke="${sk2}" stroke-opacity=".5" stroke-width="1.4" fill="none"/>`:"")+
    `<ellipse cx="100" cy="${nt-1.8}" rx="${f1(nw2*.5)}" ry="3.4" fill="${skL}" opacity=".45" ${blur1}/>`+
    `<path d="M${f1(100-nw2*.55)} ${nt+.4}Q100 ${nt+3} ${f1(100+nw2*.55)} ${nt+.4}" stroke="${sk2}" stroke-width="1.1" stroke-opacity=".35" fill="none"/>`+
    [-1,1].map(s=>`<ellipse cx="${f1(100+s*nw2*.42)}" cy="${nt+.7}" rx="${f1(nw2*.16+.8)}" ry="${NP.up?1.5:1.05}" fill="${sk3}" opacity=".55" transform="rotate(${s*-15} ${f1(100+s*nw2*.42)} ${nt+.7})"/><path d="M${f1(100+s*nw2)} ${nt-3}C${f1(100+s*(nw2+1.6))} ${nt-.5} ${f1(100+s*nw2*.8)} ${nt+1.8} ${f1(100+s*nw2*.4)} ${nt+1.4}" stroke="${sk3}" stroke-width="1" stroke-opacity=".4" fill="none"/>`).join("")+
    `<ellipse cx="100" cy="${nt+4.5}" rx="${f1(nw2*.7)}" ry="2" fill="${sk2}" opacity=".35" ${blur1}/>`;
  /* boca */
  const MP=MOUTH[c.boca]||MOUTH.neutra,my=nt+(gF?12.5:13.5);let ut=(gF?4.2:gM?3:3.5)-(old?1:0),lt=(gF?5:gM?4:4.4)-(old?1:0);
  const mw=MP.mw+(gM?.5:0),Lc=[100-mw,my+MP.l],Rc=[100+mw,my+MP.r],cyM=(MP.l+MP.r)/2;
  const lipBase=mk==="dramatica"?"#7A1A2A":mk==="dourada"?"#A8523A":mk==="natural"?mix(sh(skin,-18),"#C0566A",.5):mix(sh(skin,-22),"#B5525A",gF?.42:.18);
  const lipD=sh(lipBase,-30),lipL=sh(lipBase,22);
  let mouth;
  const upperLip=`M${f1(Lc[0])} ${f1(Lc[1])}C${f1(100-mw*.6)} ${f1(my-ut*.8+cyM*.4)} 94 ${my-ut} 97.4 ${my-ut}Q100 ${f1(my-ut+1.8)} 102.6 ${my-ut}C106 ${my-ut} ${f1(100+mw*.6)} ${f1(my-ut*.8+cyM*.4)} ${f1(Rc[0])} ${f1(Rc[1])}`;
  if(MP.open){
    const oh=MP.open;const inner=`M${f1(Lc[0]+1)} ${f1(Lc[1])}Q100 ${f1(my-1.5+cyM*.3)} ${f1(Rc[0]-1)} ${f1(Rc[1])}Q100 ${f1(my+oh+(-cyM)*.6)} ${f1(Lc[0]+1)} ${f1(Lc[1])}Z`;
    mouth=c.boca==="surpresa"?`<ellipse cx="100" cy="${my+2}" rx="6.5" ry="${oh}" fill="${lipBase}"/><ellipse cx="100" cy="${my+2}" rx="4.4" ry="${oh-2.2}" fill="#2A0E0E"/><ellipse cx="98.5" cy="${my+oh+.4}" rx="2.6" ry=".9" fill="${lipL}" opacity=".6"/>`:
      `<path d="${upperLip}Q100 ${f1(my-1+cyM*.3)} ${f1(Lc[0])} ${f1(Lc[1])}Z" fill="${lipBase}"/><path d="M${f1(Lc[0])} ${f1(Lc[1])}Q100 ${f1(my+oh+lt-cyM*.6)} ${f1(Rc[0])} ${f1(Rc[1])}Z" fill="${lipBase}"/><path d="${inner}" fill="#2A0E0E"/><clipPath id="${id("mo")}"><path d="${inner}"/></clipPath><g clip-path="url(#${id("mo")})"><rect x="${100-mw}" y="${f1(my-6)}" width="${2*mw}" height="${f1(6.4+cyM*.2)}" fill="#F2ECE2"/><path d="M${100-mw*.5} ${my-4}v5M100 ${my-4}v5.4M${100+mw*.5} ${my-4}v5" stroke="#CFC4B4" stroke-width=".6"/>${c.boca==="gargalhada"?`<ellipse cx="100" cy="${my+oh-1}" rx="7" ry="4" fill="#C0565E"/>`:""}</g><ellipse cx="99" cy="${f1(my+oh+lt*.5-cyM*.5)}" rx="4" ry="1" fill="${lipL}" opacity=".5"/>`;
  }else{
    const midY=my+cyM*-.6+1;
    mouth=`<path d="${upperLip}Q100 ${f1(midY)} ${f1(Lc[0])} ${f1(Lc[1])}Z" fill="url(#lu${k})"/><path d="M${f1(Lc[0])} ${f1(Lc[1])}Q100 ${f1(midY)} ${f1(Rc[0])} ${f1(Rc[1])}C${f1(100+mw*.55)} ${f1(my+lt+MP.r*.3)} 104 ${my+lt} 100 ${my+lt}C96 ${my+lt} ${f1(100-mw*.55)} ${f1(my+lt+MP.l*.3)} ${f1(Lc[0])} ${f1(Lc[1])}Z" fill="url(#ll${k})"/>`+
      `<path d="M${f1(Lc[0])} ${f1(Lc[1])}Q100 ${f1(midY)} ${f1(Rc[0])} ${f1(Rc[1])}" stroke="${sh(lipD,-30)}" stroke-width="1.1" fill="none" stroke-linecap="round"/>`+
      `<ellipse cx="98.4" cy="${f1(my+lt*.55)}" rx="${f1(mw*.32)}" ry="1.1" fill="#fff" opacity="${mk==="nenhuma"?.18:.3}" ${blur1}/>`+
      [Lc,Rc].map(([x,y],i)=>`<path d="M${f1(x+(i?-.5:.5))} ${f1(y-1)}q${i?1.2:-1.2} .8 ${i?.6:-.6} 2.2" stroke="${sk3}" stroke-opacity=".45" stroke-width=".8" fill="none"/>`).join("");
    if(c.boca==="presas")mouth+=`<path d="M89 ${my+2}l2.6-10 3 10ZM105 ${my+2}l3-10 2.6 10Z" fill="#F4EEDC" stroke="#B4A88E" stroke-width=".7"/>`;
  }
  mouth=`<path d="M97.6 ${nt+4}L97.2 ${my-ut-.4}M102.4 ${nt+4}L102.8 ${my-ut-.4}" stroke="${sk2}" stroke-opacity=".3" stroke-width=".9"/><ellipse cx="100" cy="${f1(my+lt+3.6)}" rx="6.5" ry="2.2" fill="${sk2}" opacity=".4" ${blur1}/>`+mouth;
  if(mature||MP.l<-2)mouth+=[-1,1].map(s=>`<path d="M${f1(100+s*(nw2+2.5))} ${nt-1.5}Q${f1(100+s*(mw+5.5))} ${f1(my-3)} ${f1(100+s*(mw+3))} ${f1(my+5)}" stroke="${sk3}" stroke-opacity="${old?.5:mature?.32:.22}" stroke-width="${old?1.2:.9}" fill="none"/>`).join("");
  /* sombreamento do rosto */
  const shade=`<g clip-path="url(#hc${k})"><g ${blur}>`+
    `<path d="M${100+cheek*.5} ${T-4}C${100+cw+6} ${T+20} ${100+cw+3} ${T+70} ${100+chinW} ${chinY+4}L${100+cw+12} ${chinY+6}V${T-4}Z" fill="${sk3}" opacity=".42"/>`+
    `<path d="M${100-cheek*.6} ${T-4}C${100-cw-4} ${T+20} ${100-cw-2} ${T+70} ${100-chinW} ${chinY+4}L${100-cw-12} ${chinY+6}V${T-4}Z" fill="${sk2}" opacity=".18"/>`+
    [-1,1].map(s=>`<ellipse cx="${100+s*(cheek-2)}" cy="${T+30}" rx="5" ry="11" fill="${sk2}" opacity=".35"/><ellipse cx="${100+s*(cheek-7)}" cy="${T+59}" rx="8" ry="3.4" fill="${sk3}" opacity="${gM?.3:.22}" transform="rotate(${s*-22} ${100+s*(cheek-7)} ${T+59})"/><ellipse cx="${100+s*(cheek-12)}" cy="${T+50}" rx="6.5" ry="3" fill="${mk==="dourada"?"#FFE6A8":skL}" opacity="${mk==="dourada"?.75:.45}"/><ellipse cx="${100+s*(cheek-13)}" cy="${T+57}" rx="7" ry="4.6" fill="#E0707A" opacity="${mk==="natural"||mk==="dramatica"?.34:gF?.22:.1}"/>`).join("")+
    `<ellipse cx="95" cy="${T+15}" rx="13" ry="7.5" fill="${skL}" opacity=".55"/><ellipse cx="100" cy="${chinY-6}" rx="${chinW+3}" ry="3.6" fill="${skL}" opacity=".35"/><ellipse cx="100" cy="${chinY+1}" rx="${jaw}" ry="4" fill="${sk3}" opacity=".3"/>`+
    (c.raca==="orc"?`<path d="M${100-jaw} ${T+66}Q100 ${chinY+8} ${100+jaw} ${T+66}" stroke="${sk3}" stroke-width="5" fill="none" opacity=".35"/><ellipse cx="100" cy="${T+28}" rx="22" ry="4" fill="${sk3}" opacity=".35"/>`:"")+
    `</g><path d="${headD}" fill="none" stroke="${rim}" stroke-width="3" opacity=".32" transform="translate(-2.2 0)" ${blur1}/></g>`;
  const ageLines=old?`<path d="M84 ${T+12}Q100 ${T+9} 116 ${T+12}M86 ${T+17}Q100 ${T+14.5} 114 ${T+17}M89 ${T+22}Q100 ${T+20} 111 ${T+22}" stroke="${sk3}" stroke-opacity=".35" stroke-width=".8" fill="none"/>`:"";
  /* maquiagem dourada: brilho */
  const shimmer=mk==="dourada"?[[84,92],[90,91],[110,91],[116,92],[100,T+12]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r=".8" fill="#FFF3C4"/>`).join(""):"";
  /* marcas e pintura */
  const scar=sh(skin,-42),scarL=sh(skin,15);
  const MK={nenhuma:"",cicatriz:`<path d="M80 80L94 116" stroke="${scar}" stroke-width="2.2" stroke-linecap="round" opacity=".8"/><path d="M81 81L95 117" stroke="${scarL}" stroke-width=".8" opacity=".7"/><path d="M83 88l5-1M86 96l5-1M89 104l5-1" stroke="${scar}" stroke-width="1.1" opacity=".7"/>`,
    bochecha:`<path d="M114 112L128 120" stroke="${scar}" stroke-width="2.2" stroke-linecap="round" opacity=".8"/><path d="M114 113L128 121" stroke="${scarL}" stroke-width=".7" opacity=".7"/>`,
    sardas:[[80,108],[83,112],[86,108],[89,111],[78,113],[92,107],[95,110],[100,106],[105,110],[108,107],[111,111],[114,108],[117,112],[120,108],[122,113],[85,115],[115,115]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="${i%3?.8:1.1}" fill="${sh(skin,-40)}" opacity="${i%2?.55:.75}"/>`).join(""),
    pinta:`<circle cx="113.5" cy="${f1(my-5)}" r="1.2" fill="${sh(skin,-62)}"/>`,
    tapaolho:`<path d="M${100-cw} 84L${100+cw} 110" stroke="#1A1412" stroke-width="2.2"/><ellipse cx="113" cy="99" rx="11" ry="9" fill="#1A1412"/><ellipse cx="110" cy="96" rx="5" ry="2.4" fill="#fff" opacity=".12"/>`,
    tatuagem:`<path d="M120 104q6 6 0 12q-6 6 0 12M126 104q4 8 0 16" stroke="#2E4C9A" stroke-width="1.6" fill="none" opacity=".75"/>`}[c.marca]||"";
  const pc=c.corPintura;const PT={nenhuma:"",listras:`<g opacity=".85"><path d="M72 106L90 104M74 112L90 110M110 104L128 106M110 110L126 112" stroke="${pc}" stroke-width="2.8" stroke-linecap="round"/></g>`,
    mascara:`<path d="M${100-cw} 90Q100 82 ${100+cw} 90L${100+cw-2} 106Q100 99 ${100-cw+2} 106Z" fill="${pc}" opacity=".78"/>`,
    runas:`<path d="M96 70l4-6 4 6-4 6ZM100 64v-2" stroke="${pc}" stroke-width="1.8" fill="none"/><circle cx="100" cy="70" r="8" fill="${pc}" opacity=".22"/>`,
    pontos:[[80,112],[86,116],[92,112],[108,112],[114,116],[120,112],[100,72],[94,76],[106,76]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.6" fill="${pc}" opacity=".9"/>`).join("")}[c.pintura]||"";
  /* cabelo */
  const g={cw,T,hc,hd,hl,ti:0};const HR=hairSvg(c,k,g);
  /* barba */
  const bshape=ext=>`M${100-cw} ${T+40}C${100-cw} ${T+64} ${100-jaw-2} ${T+76} ${100-chinW-8} ${chinY+ext-4}Q100 ${chinY+ext+3} ${100+chinW+8} ${chinY+ext-4}C${100+jaw+2} ${T+76} ${100+cw} ${T+64} ${100+cw} ${T+40}L${100+cw-4} ${T+44}C${100+cw-7} ${T+60} ${f1(100+mw+6)} ${f1(my-2)} ${f1(100+mw+2)} ${f1(my+3)}Q100 ${f1(my+lt+5)} ${f1(100-mw-2)} ${f1(my+3)}C${f1(100-mw-6)} ${f1(my-2)} ${100-cw+7} ${T+60} ${100-cw+4} ${T+44}Z`;
  const btex=(d,y1)=>`<clipPath id="${id("bd")}"><path d="${d}"/></clipPath><g clip-path="url(#${id("bd")})" stroke-linecap="round">${Array.from({length:18},(_,i)=>{const x=100-cw+i*(2*cw)/17;return `<path d="M${f1(x)} ${T+46+(i%3)*4}Q${f1(x+(x-100)*.08)} ${f1((T+46+y1)/2)} ${f1(100+(x-100)*.7)} ${y1}" stroke="${i%2?hd:hl}" stroke-opacity=".45" stroke-width=".8" fill="none"/>`}).join("")}</g>`;
  const must=(big)=>`<path d="M${f1(100-mw-(big?6:1))} ${f1(my+(big?3:-.5))}Q${f1(100-mw*.6)} ${f1(my-ut-5)} 100 ${f1(my-ut-2.6)}Q${f1(100+mw*.6)} ${f1(my-ut-5)} ${f1(100+mw+(big?6:1))} ${f1(my+(big?3:-.5))}Q${f1(100+mw*.4)} ${f1(my-ut+.6)} 100 ${f1(my-ut+.4)}Q${f1(100-mw*.4)} ${f1(my-ut+.6)} ${f1(100-mw-(big?6:1))} ${f1(my+(big?3:-.5))}Z" fill="url(#hr${k})" stroke="${hd}" stroke-width=".6"/>`;
  let beard="",mustache="";
  switch(c.barba){
    case "porfazer":beard=`<g clip-path="url(#hc${k})"><path d="${bshape(2)}" fill="${hd}" opacity=".26"/></g>`;mustache=`<path d="M${100-mw} ${f1(my-1)}Q100 ${f1(my-ut-5)} ${100+mw} ${f1(my-1)}Q100 ${f1(my-ut)} ${100-mw} ${f1(my-1)}Z" fill="${hd}" opacity=".22"/>`;break;
    case "bigode":mustache=must(0);break;
    case "bigodao":mustache=must(1);break;
    case "cavanhaque":{const d=`M${f1(100-mw+1)} ${f1(my+lt+1)}Q100 ${f1(my+lt+3.5)} ${f1(100+mw-1)} ${f1(my+lt+1)}C${100+mw} ${chinY-2} ${100+chinW+2} ${chinY+8} 100 ${chinY+12}C${100-chinW-2} ${chinY+8} ${100-mw} ${chinY-2} ${f1(100-mw+1)} ${f1(my+lt+1)}Z`;beard=`<path d="${d}" fill="url(#hr${k})" stroke="${hd}" stroke-width=".6"/>`;mustache=must(0);break}
    case "curta":case "cheia":{const ext=c.barba==="curta"?5:14,d=bshape(ext);beard=`<path d="${d}" fill="url(#hr${k})" stroke="${hd}" stroke-width=".6"/>`+btex(d,chinY+ext);mustache=must(0);break}
    case "longa":{const d=`M${100-cw} ${T+40}C${100-cw} ${T+70} ${100-jaw-4} ${T+92} 100 ${chinY+52}C${100+jaw+4} ${T+92} ${100+cw} ${T+70} ${100+cw} ${T+40}L${100+cw-4} ${T+44}C${100+cw-7} ${T+60} ${f1(100+mw+6)} ${f1(my-2)} ${f1(100+mw+2)} ${f1(my+3)}Q100 ${f1(my+lt+5)} ${f1(100-mw-2)} ${f1(my+3)}C${f1(100-mw-6)} ${f1(my-2)} ${100-cw+7} ${T+60} ${100-cw+4} ${T+44}Z`;
      beard=`<path d="${d}" fill="url(#hr${k})" stroke="${hd}" stroke-width=".6"/>`+btex(d,chinY+52)+`<rect x="93" y="${chinY+26}" width="14" height="5" rx="2" fill="${dc}"/><rect x="95" y="${chinY+38}" width="10" height="4" rx="2" fill="${dc}"/>`;mustache=must(1);break}
  }
  /* acessórios do rosto */
  const lobeX=100-cw-1.5,lobeY=114;
  const ACC={nenhum:"",argolas:[lobeX,200-lobeX].map(x=>`<circle cx="${x}" cy="${lobeY+5}" r="5" fill="none" stroke="#E2B24F" stroke-width="1.6"/><path d="M${x-3.4} ${lobeY+2}a5 5 0 0 1 4-1.6" stroke="#FFF1B8" stroke-width=".8" fill="none"/>`).join(""),
    perolas:[lobeX,200-lobeX].map(x=>`<circle cx="${x}" cy="${lobeY+2.5}" r="2.6" fill="#F4F0E8" stroke="#BDB5A6" stroke-width=".5"/><circle cx="${x-.8}" cy="${lobeY+1.6}" r=".8" fill="#fff"/>`).join(""),
    oculos:`<g fill="#fff" fill-opacity=".1" stroke="#3A2A1E" stroke-width="1.6"><circle cx="${ex}" cy="${ey}" r="10"/><circle cx="${200-ex}" cy="${ey}" r="10"/></g><path d="M${ex+10} ${ey-1}Q100 ${ey-4} ${200-ex-10} ${ey-1}M${ex-10} ${ey-2}L${100-cw} ${ey-4}M${200-ex+10} ${ey-2}L${100+cw} ${ey-4}" stroke="#3A2A1E" stroke-width="1.4" fill="none"/><path d="M${ex-5} ${ey-6}l4 -2M${200-ex-5} ${ey-6}l4 -2" stroke="#fff" stroke-opacity=".7"/>`,
    monoculo:`<circle cx="${200-ex}" cy="${ey}" r="10" fill="#fff" fill-opacity=".12" stroke="#C9A24A" stroke-width="1.8"/><path d="M${200-ex+7} ${ey+7}Q${200-ex+14} ${ey+30} ${200-ex+4} ${ey+60}" stroke="#C9A24A" stroke-width=".9" fill="none"/>`,
    piercing:`<circle cx="${f1(100+nw2*.62)}" cy="${nt+1}" r="1.8" fill="none" stroke="#DDE3E8" stroke-width="1"/>`,
    sobrancelha:`<circle cx="${200-bo[0]-1}" cy="${bo[1]-3}" r="1.1" fill="#DDE3E8"/><circle cx="${200-bo[0]+2}" cy="${bo[1]+2}" r="1.1" fill="#DDE3E8"/>`}[c.rostoAcc]||"";
  /* chifres */
  const bone=`url(#hn${k})`;const hornL={nenhum:"",curvos:`<path d="M76 70Q56 44 70 18Q68 46 88 62Z" fill="${bone}" stroke="#6E5E44"/><path d="M74 60Q66 44 70 26" stroke="#fff" stroke-opacity=".35" fill="none"/>`,
    carneiro:`<path d="M74 70Q42 58 46 90Q52 110 66 100Q54 94 58 84Q62 72 78 78Z" fill="${bone}" stroke="#6E5E44"/><path d="M52 78q4 2 4 6M50 88q4 1 5 4" stroke="#6E5E44" stroke-opacity=".6" fill="none"/>`,
    retos:`<path d="M82 64L70 22L90 60Z" fill="${bone}" stroke="#6E5E44"/>`,
    galhada:`<path d="M84 62L70 30M74 40L58 32M72 34L74 16M78 48L62 50" stroke="#7A5233" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M84 62L70 30" stroke="#B08A60" stroke-width="1.5" stroke-linecap="round"/>`}[c.chifres]||"";
  const horns=c.chifres==="aureola"?`<ellipse cx="100" cy="36" rx="34" ry="8" fill="none" stroke="#FFE08A" stroke-width="10" opacity=".35" ${blur1}/><ellipse cx="100" cy="36" rx="34" ry="8" fill="none" stroke="#FFE08A" stroke-width="3"/>`:hornL+mirror(hornL);
  /* pescoço e tronco */
  const neckD=`M${100-nw} 118L${100-nw+.5} 160Q${100-nw-4} 170 ${100-nw-12} 176H${100+nw+12}Q${100+nw+4} 170 ${100+nw-.5} 160L${100+nw} 118Z`;
  const neck=`<path d="${neckD}" fill="url(#nk${k})"/><g clip-path="url(#nc${k})"><ellipse cx="100" cy="${chinY+4}" rx="${jaw+2}" ry="10" fill="${sk3}" opacity=".6" ${blur}/><path d="M${100+nw-3} 126L104 168" stroke="${sk2}" stroke-width="3" opacity=".35" ${blur1}/><path d="M${100-nw+3} 126L96 168" stroke="${skL}" stroke-width="2" opacity=".25" ${blur1}/>${gM?`<ellipse cx="100" cy="${chinY+15}" rx="2.6" ry="3.4" fill="${skL}" opacity=".45" ${blur1}/>`:""}</g>`;
  const torsoD=`M${100-sw-6} 240C${100-sw-4} 206 ${100-sw+4} 184 ${f1(100-sw*.62)} 175C${100-nw-14} 169 ${100-nw-4} 167 ${100-nw} 163L100 171L${100+nw} 163C${100+nw+4} 167 ${100+nw+14} 169 ${f1(100+sw*.62)} 175C${100+sw-4} 184 ${100+sw+4} 206 ${100+sw+6} 240Z`;
  const torso=`<path d="${torsoD}" fill="url(#cl${k})" stroke="${rd}" stroke-width="1.2"/>`;
  const px=100-(sw-24),pr=sw>=80?32:28;
  const R={tunica:torso+`<path d="M${100-nw-2} 165L100 194L${100+nw+2} 165" stroke="${dc}" stroke-width="3.5" fill="none"/><path d="M${100-sw+6} 222Q100 230 ${100+sw-6} 222" stroke="${dc}" stroke-width="5" fill="none" opacity=".85"/>`,
    campones:torso+`<path d="M${100-nw-1} 166L100 188L${100+nw+1} 166" fill="url(#nk${k})"/><path d="M95 176l10 4M95 182l10-4" stroke="${rd}" stroke-width="1.4"/><path d="M${100-sw+10} 240Q${100-sw+14} 192 ${100-nw-14} 172L${100-nw-6} 240ZM${100+sw-10} 240Q${100+sw-14} 192 ${100+nw+14} 172L${100+nw+6} 240Z" fill="${dc}" opacity=".9"/>`,
    couro:torso+`<path d="M${100-sw+20} 240L128 168M${100+sw-20} 240L72 168" stroke="${dc}" stroke-width="7"/><path d="M${100-sw+20} 240L128 168" stroke="#fff" stroke-opacity=".25" stroke-dasharray="3 4"/><rect x="92" y="200" width="16" height="12" rx="2" fill="#C9A24A" stroke="#7A5A1E"/>`,
    malha:`<defs><pattern id="ml${k}" width="6" height="4.5" patternUnits="userSpaceOnUse"><path d="M0 4.5Q3 0 6 4.5" stroke="${sh(rc,-35)}" fill="none" stroke-width="1"/></pattern></defs>`+torso+`<path d="${torsoD}" fill="url(#ml${k})"/><path d="M80 174H120L126 240H74Z" fill="${dc}"/><path d="M100 188l8 10-8 10-8-10Z" fill="#E2B24F"/>`,
    placas:torso+`<ellipse cx="${px}" cy="186" rx="${pr}" ry="18" fill="url(#cl${k})" stroke="${rd}" stroke-width="2"/><ellipse cx="${200-px}" cy="186" rx="${pr}" ry="18" fill="url(#cl${k})" stroke="${rd}" stroke-width="2"/><path d="M${px-pr+10} 190Q${px} 178 ${px+pr-6} 192M${200-px+pr-10} 190Q${200-px} 178 ${200-px-pr+6} 192" stroke="${rl}" stroke-width="2" fill="none"/><path d="M${100-nw-6} 167Q100 177 ${100+nw+6} 167L118 179Q100 187 82 179Z" fill="${rl}" stroke="${rd}"/><path d="M100 187V236M70 210Q100 220 130 210" stroke="${rd}" stroke-width="2"/><circle cx="${px}" cy="186" r="2.5" fill="${dc}"/><circle cx="${200-px}" cy="186" r="2.5" fill="${dc}"/><path d="M90 197l10 -8 10 8-10 14Z" fill="${dc}"/><ellipse cx="${px-8}" cy="180" rx="10" ry="4" fill="#fff" opacity=".25" ${blur1}/>`,
    manto:`<path d="M${100-sw-18} 240Q${100-sw-14} 166 ${100-sw+20} 156L100 166L${100+sw-20} 156Q${100+sw+14} 166 ${100+sw+18} 240Z" fill="${dc}"/>`+torso+`<path d="M${100-nw-26} 162Q100 198 ${100+nw+26} 162L${100+nw+20} 178Q100 208 ${100-nw-20} 178Z" fill="${sh(dc,-15)}"/><circle cx="100" cy="184" r="7" fill="#C9A24A" stroke="#7A5A1E" stroke-width="1.5"/><circle cx="98" cy="182" r="2" fill="#fff" opacity=".5"/>`,
    mago:torso+`<path d="M${100-nw-16} 166L${100-nw-26} 142Q100 162 ${100+nw+26} 142L${100+nw+16} 166Q100 182 ${100-nw-16} 166Z" fill="${dc}"/><path d="M100 172V240" stroke="${dc}" stroke-width="5"/>${[[52,206],[146,214],[70,228],[132,192],[40,230]].map(([x,y])=>`<path d="M${x} ${y-4}l1.5 3 3 1-3 1-1.5 3-1.5-3-3-1 3-1z" fill="${dc}"/>`).join("")}`,
    sacerdote:torso+`<path d="M${100-nw-8} 167L${100-nw-16} 240H${100-nw}L${100-nw+6} 171ZM${100+nw+8} 167L${100+nw+16} 240H${100+nw}L${100+nw-6} 171Z" fill="${dc}"/><circle cx="100" cy="206" r="10" fill="none" stroke="${dc}" stroke-width="3"/><path d="M100 190v32M84 206h32" stroke="${dc}" stroke-width="2"/>`,
    nobre:torso+`<path d="M${100-nw-26} 166Q100 188 ${100+nw+26} 166Q${100+nw+26} 178 124 178Q112 186 100 180Q88 186 76 178Q${100-nw-26} 178 ${100-nw-26} 166Z" fill="#F4EFE6" stroke="#CFC6B6"/><path d="M${100-sw+12} 196L${100+sw-8} 240" stroke="${dc}" stroke-width="10"/>${[192,206,220,234].map(y=>`<circle cx="100" cy="${y}" r="2.6" fill="#E2B24F"/>`).join("")}`,
    peles:`<path d="${torsoD}" fill="url(#nk${k})" stroke="${sk2}"/><path d="M98 184Q90 212 80 216M102 184Q110 212 120 216" stroke="${sk2}" stroke-width="2" fill="none" opacity=".7"/>${[-.9,-.62,-.34,.34,.62,.9].map((t,i)=>`<ellipse cx="${f1(100+t*sw)}" cy="${180+(i%2)*6}" rx="16" ry="12" fill="${i%2?sh(rc,15):rc}"/>`).join("")}<path d="M${100-sw+20} 170L${100+sw-20} 240" stroke="${dc}" stroke-width="7"/>`}[c.roupa];
  const torsoShade=`<clipPath id="${id("tc")}"><path d="${torsoD}"/></clipPath><g clip-path="url(#${id("tc")})"><rect x="100" y="150" width="${sw+10}" height="90" fill="url(#ts${k})"/><ellipse cx="100" cy="170" rx="${nw+14}" ry="6" fill="#000" opacity=".22" ${blur}/>${gF?`<path d="M${f1(100-sw*.44)} 208Q${f1(100-sw*.22)} 222 98 211M102 211Q${f1(100+sw*.22)} 222 ${f1(100+sw*.44)} 208" stroke="#000" stroke-opacity=".2" stroke-width="2.4" fill="none" ${blur1}/>`:""}<path d="M${100-sw+14} 236Q${100-sw*.5} 206 ${100-sw*.3} 184M${100+sw-14} 236Q${100+sw*.5} 206 ${100+sw*.3} 184" stroke="#000" stroke-opacity=".14" stroke-width="3" fill="none" ${blur1}/><path d="${torsoD}" fill="none" stroke="${rim}" stroke-width="4" opacity=".4" transform="translate(-2.6 0)" ${blur1}/></g>`;
  /* chapéu */
  const hw=c.corChapeu,hwd=sh(hw,-30),hwl=sh(hw,25),hL=100-cw,hR=100+cw;const H={nenhum:"",
    capuz:`<path d="M${hL-12} 176Q${hL-22} 30 100 28Q${hR+22} 30 ${hR+12} 176L${hR-2} 176Q${hR+6} 62 100 58Q${hL-6} 62 ${hL+2} 176Z" fill="${hw}" stroke="${hwd}" stroke-width="1.4"/><path d="M${hL+2} 80Q100 54 ${hR-2} 80" stroke="${hwl}" stroke-width="2" fill="none"/><path d="M${hR+4} 70Q${hR+10} 120 ${hR+6} 170" stroke="${hwd}" stroke-width="5" opacity=".5" fill="none" ${blur1}/>`,
    mago:`<path d="M66 64Q84 44 100 -6Q110 30 140 64Z" fill="${hw}" stroke="${hwd}"/><ellipse cx="100" cy="66" rx="54" ry="10" fill="${hw}" stroke="${hwd}"/><path d="M72 56Q100 48 130 56" stroke="${c.corDetalhe}" stroke-width="5" fill="none"/><path d="M104 24l2 4 4 1-4 1-2 4-2-4-4-1 4-1z" fill="#FFE08A"/><path d="M118 60Q116 30 104 4" stroke="${hwd}" stroke-width="4" opacity=".4" fill="none" ${blur1}/>`,
    bardo:`<ellipse cx="100" cy="64" rx="56" ry="12" fill="${hw}" stroke="${hwd}" transform="rotate(-8 100 64)"/><path d="M70 62Q72 34 100 32Q128 34 128 58Z" fill="${hw}" stroke="${hwd}"/><path d="M118 46Q150 6 170 12Q146 22 124 54Z" fill="${c.corDetalhe}"/><path d="M124 52Q148 20 168 13" stroke="#fff" stroke-opacity=".6" fill="none"/>`,
    elmo:`<path d="M${hL-4} 98Q${hL-8} 48 100 46Q${hR+8} 48 ${hR+4} 98H${hR-8}Q${hR-10} 70 100 68Q${hL+10} 70 ${hL+8} 98Z" fill="url(#hm${k})" stroke="#4E5862" stroke-width="1.6"/><path d="M96 66h8v40h-8z" fill="url(#hm${k})" stroke="#4E5862"/><path d="M${hL-6} 80H${hR+6}" stroke="#4E5862" stroke-width="2"/><ellipse cx="86" cy="58" rx="10" ry="4" fill="#fff" opacity=".4" ${blur1}/>`,
    viking:`<path d="M66 82Q72 34 52 22Q48 52 66 82ZM134 82Q128 34 148 22Q152 52 134 82Z" fill="#EDE3C8" stroke="#8C7A5E"/><path d="M${hL-4} 92Q${hL-8} 48 100 46Q${hR+8} 48 ${hR+4} 92Z" fill="url(#hm${k})" stroke="#4E5862" stroke-width="1.6"/><path d="M${hL-4} 86H${hR+4}" stroke="${c.corDetalhe}" stroke-width="5"/><path d="M96 86h8v24h-8z" fill="url(#hm${k})" stroke="#4E5862"/><ellipse cx="86" cy="58" rx="10" ry="4" fill="#fff" opacity=".4" ${blur1}/>`,
    coroa:`<path d="M68 ${T+14}L66 ${T-16}L80 ${T}L90 ${T-26}L100 ${T-4}L110 ${T-26}L120 ${T}L134 ${T-16}L132 ${T+14}Z" fill="url(#gd${k})" stroke="#9A7420" stroke-width="1.2"/><circle cx="100" cy="${T+6}" r="4" fill="${hw}"/><circle cx="82" cy="${T+8}" r="3" fill="#3D74C4"/><circle cx="118" cy="${T+8}" r="3" fill="#3E8A4F"/><circle cx="99" cy="${T+5}" r="1.2" fill="#fff" opacity=".7"/>`,
    tiara:`<path d="M${hL+2} ${T+20}Q100 ${T+4} ${hR-2} ${T+20}" stroke="url(#gd${k})" stroke-width="3.5" fill="none"/><path d="M100 ${T-2}l6 10-6 6-6-6Z" fill="${hw}" stroke="#E2B24F" stroke-width="1.5"/>`,
    bandana:`<path d="M${hL-2} 82Q100 56 ${hR+2} 82L${hR+2} 74Q100 46 ${hL-2} 74Z" fill="${hw}" stroke="${hwd}"/><path d="M${hR} 78L${hR+20} 96L${hR+10} 98L${hR+14} 108L${hR-2} 86Z" fill="${hw}" stroke="${hwd}"/>${[78,96,114].map(x=>`<circle cx="${x}" cy="70" r="2" fill="#fff" opacity=".7"/>`).join("")}`,
    faixa:`<path d="M${hL} 80Q100 68 ${hR} 80V88Q100 76 ${hL} 88Z" fill="${hw}" stroke="${hwd}"/><path d="M${hL} 84L${hL-14} 104M${hL+2} 86L${hL-8} 112" stroke="${hw}" stroke-width="4" stroke-linecap="round"/>`}[c.chapeu]||"";
  /* itens (iguais à v0.4) */
  const I={nenhum:"",
    espada:`<path d="M168 236L188 70L194 72L178 238Z" fill="url(#mt${k})" stroke="#5C6670"/><path d="M160 196L196 202" stroke="#7A5A1E" stroke-width="7" stroke-linecap="round"/><path d="M176 204L172 236" stroke="#5A3A22" stroke-width="6"/>`,
    machado:`<path d="M174 240L182 90" stroke="#6B4428" stroke-width="7" stroke-linecap="round"/><path d="M182 96Q214 92 206 130Q196 116 180 120Z" fill="url(#mt${k})" stroke="#5C6670"/><path d="M180 100Q156 92 160 124Q168 114 180 116Z" fill="url(#mt${k})" stroke="#5C6670"/>`,
    martelo:`<path d="M176 240L180 110" stroke="#6B4428" stroke-width="7" stroke-linecap="round"/><rect x="156" y="88" width="48" height="28" rx="4" fill="url(#mt${k})" stroke="#5C6670"/><path d="M164 102h32" stroke="#E2B24F" stroke-width="3"/>`,
    cajado:`<path d="M180 240L176 70" stroke="#6B4428" stroke-width="7" stroke-linecap="round"/><path d="M176 74Q160 60 168 44Q180 52 176 74Q194 60 186 42" stroke="#6B4428" stroke-width="5" fill="none"/><circle cx="177" cy="50" r="12" fill="#7FE3FF" opacity=".5" ${blur1}/><circle cx="177" cy="50" r="6" fill="#DFF8FF"/>`,
    varinha:`<path d="M160 230L186 150" stroke="#3A2416" stroke-width="5" stroke-linecap="round"/><path d="M188 132l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#FFE08A"/><circle cx="188" cy="144" r="12" fill="#FFE08A" opacity=".3" ${blur1}/>`,
    arco:`<path d="M30 70Q-6 156 30 236" stroke="#6B4428" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M30 70V236" stroke="#EDE3C8" stroke-width="1.4"/><path d="M14 120h50" stroke="#5A3A22" stroke-width="2.5"/><path d="M64 116l8 4-8 4z" fill="#8C96A0"/>`,
    adaga:`<path d="M170 236L182 176L188 178L178 238Z" fill="url(#mt${k})" stroke="#5C6670"/><path d="M168 212L192 218" stroke="#7A5A1E" stroke-width="5" stroke-linecap="round"/><path d="M30 236L18 176L12 178L22 238Z" fill="url(#mt${k})" stroke="#5C6670"/><path d="M32 212L8 218" stroke="#7A5A1E" stroke-width="5" stroke-linecap="round"/>`,
    escudo:`<path d="M6 150Q34 140 62 150Q62 206 34 236Q6 206 6 150Z" fill="${c.corDetalhe}" stroke="#7A5A1E" stroke-width="4"/><path d="M34 158V224M14 176H54" stroke="#E2B24F" stroke-width="5"/>`,
    alaude:`<ellipse cx="168" cy="206" rx="26" ry="30" fill="#A8692E" stroke="#5A3A22" stroke-width="2"/><circle cx="168" cy="200" r="7" fill="#2A190E"/><path d="M160 180L140 104" stroke="#5A3A22" stroke-width="8" stroke-linecap="round"/><path d="M162 188L144 112M168 188L150 112" stroke="#EDE3C8" stroke-width=".8"/>`,
    livro:`<path d="M12 192L52 184L56 236L16 240Z" fill="#5B2A6B" stroke="#2A1230" stroke-width="2"/><path d="M20 196L48 191" stroke="#E2B24F" stroke-width="2"/><circle cx="35" cy="214" r="7" fill="none" stroke="#E2B24F" stroke-width="2"/><path d="M52 184L58 188L60 236L56 236" fill="#EDE3C8"/>`,
    tocha:`<path d="M176 240L184 160" stroke="#6B4428" stroke-width="8" stroke-linecap="round"/><circle cx="184" cy="146" r="24" fill="#FFB347" opacity=".35" ${blur}/><path d="M174 160Q172 136 186 120Q184 136 196 146Q196 160 184 162Z" fill="#FF7A2A"/><path d="M180 160Q180 146 186 138Q188 150 192 152Q190 160 184 161Z" fill="#FFE08A"/>`,
    orbe:`<circle cx="172" cy="196" r="26" fill="${c.corOlhos}" opacity=".35" ${blur}/><circle cx="172" cy="196" r="16" fill="url(#ob${k})"/><circle cx="166" cy="190" r="4" fill="#fff" opacity=".8"/>`}[c.item]||"";
  const au=auraSvg(c,k);
  const ir0=c.corOlhos;
  const defs=`<defs><radialGradient id="fc${k}" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="${skL}"/><stop offset=".55" stop-color="${skin}"/><stop offset="1" stop-color="${sk1}"/></radialGradient>
    <linearGradient id="ea${k}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${sk1}"/><stop offset="1" stop-color="${sk2}"/></linearGradient>
    <linearGradient id="nk${k}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${sk1}"/><stop offset=".45" stop-color="${skin}"/><stop offset="1" stop-color="${sk2}"/></linearGradient>
    <radialGradient id="eb${k}" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="#FBF8F3"/><stop offset=".8" stop-color="#EDE5DC"/><stop offset="1" stop-color="#CDBFB2"/></radialGradient>
    <radialGradient id="ir${k}"><stop offset="0" stop-color="${sh(ir0,-35)}"/><stop offset=".38" stop-color="${sh(ir0,-5)}"/><stop offset=".72" stop-color="${sh(ir0,22)}"/><stop offset=".9" stop-color="${sh(ir0,-20)}"/><stop offset="1" stop-color="${sh(ir0,-60)}"/></radialGradient>
    <linearGradient id="lu${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sh(lipBase,-6)}"/><stop offset="1" stop-color="${lipD}"/></linearGradient>
    <linearGradient id="ll${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lipD}"/><stop offset=".4" stop-color="${lipBase}"/><stop offset="1" stop-color="${sh(lipBase,-12)}"/></linearGradient>
    <linearGradient id="hr${k}" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="${hl}"/><stop offset=".45" stop-color="${hc}"/><stop offset="1" stop-color="${hd}"/></linearGradient>
    <linearGradient id="cl${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${rl}"/><stop offset=".55" stop-color="${rc}"/><stop offset="1" stop-color="${rd}"/></linearGradient>
    <linearGradient id="ts${k}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>
    <linearGradient id="hn${k}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8C7A5E"/><stop offset="1" stop-color="#F0E6D0"/></linearGradient>
    <linearGradient id="gd${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF0B0"/><stop offset=".5" stop-color="#E2B24F"/><stop offset="1" stop-color="#9A7420"/></linearGradient>
    <linearGradient id="hm${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${sh(hw,35)}"/><stop offset="1" stop-color="${sh(hw,-30)}"/></linearGradient>
    <linearGradient id="mt${k}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F2F5F7"/><stop offset="1" stop-color="#8C96A0"/></linearGradient>
    <radialGradient id="ob${k}" cx=".35" cy=".35"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="${c.corOlhos}"/></radialGradient>
    <filter id="bl${k}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="bs${k}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1"/></filter>
    <clipPath id="hc${k}"><path d="${headD}"/></clipPath><clipPath id="nc${k}"><path d="${neckD}"/></clipPath><clipPath id="ec${k}"><path d="${scleraD}"/></clipPath>
    <clipPath id="clip${k}">${mode==="card"?`<rect width="200" height="240" rx="18"/>`:mode==="circle"?`<circle cx="100" cy="106" r="80"/>`:`<rect width="200" height="240"/>`}</clipPath>${au?au.defs:""}</defs>`;
  const scene=sceneSvg(c,k);
  const headG=`<path d="${headD}" fill="url(#fc${k})" stroke="${sk2}" stroke-width=".8"/>`;
  const body=`${au?au.body:""}${HR.back}${neck}${R}${torsoShade}${ears}${headG}${shade}${ageLines}${MK}${PT}${eyes}${shimmer}${brows}${nose}${beard}${mouth}${mustache}${HR.front}${HR.over}${ACC}${horns}${H}${I}`;
  const FR={nenhuma:"",ouro:["#E2B24F","#9A7420"],prata:["#DDE3E8","#7D8A96"],madeira:["#9C6B45","#4E2E1C"],folhas:["#5FA36E","#2E5E44"],runas:["#B47CFF","#4A2C80"]}[c.moldura];
  let frame="";
  if(FR){frame=mode==="card"?`<rect x="3" y="3" width="194" height="234" rx="16" fill="none" stroke="${FR[1]}" stroke-width="6"/><rect x="3" y="3" width="194" height="234" rx="16" fill="none" stroke="${FR[0]}" stroke-width="3"/>`:`<circle cx="100" cy="106" r="78" fill="none" stroke="${FR[1]}" stroke-width="6"/><circle cx="100" cy="106" r="78" fill="none" stroke="${FR[0]}" stroke-width="3"/>`;
    if(c.moldura==="folhas")frame+=(mode==="card"?[[10,30],[10,120],[10,210],[190,30],[190,120],[190,210],[60,6],[140,6],[100,234]]:[[30,70],[22,120],[44,166],[170,70],[178,120],[156,166],[100,28]]).map(([x,y],i)=>`<ellipse cx="${x}" cy="${y}" rx="8" ry="4" fill="#5FA36E" transform="rotate(${i*40} ${x} ${y})"/>`).join("");
    if(c.moldura==="runas")frame+=(mode==="card"?[[100,6],[100,234],[6,120],[194,120]]:[[100,28],[100,184],[22,106],[178,106]]).map(([x,y])=>`<circle cx="${x}" cy="${y}" r="6" fill="#4A2C80" stroke="#B47CFF" stroke-width="2"/>`).join("");}
  const vb=mode==="card"?VB.full:mode==="circle"?"20 26 160 160":VB[mode]||VB.full;
  const h=mode==="card"?Math.round(size*1.2):mode==="torso"?Math.round(size*.52):size;
  return `<svg viewBox="${vb}" width="${size}" height="${h}" ${title?`role="img" aria-label="${esc(title)}"`:`aria-hidden="true" focusable="false"`} style="display:block;flex:none">${defs}<g clip-path="url(#clip${k})">${renderScene(scene)}${body}<rect width="200" height="240" fill="url(#vg${k})"/></g>${mode==="card"||mode==="circle"?frame:""}</svg>`.replace(`</defs>`,`<radialGradient id="vg${k}" cx=".5" cy=".42" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient></defs>`);
}
/* sceneSvg devolve "<defs internas></defs><corpo>"; separa para o SVG ficar válido */
function renderScene(s){const i=s.indexOf("</defs>");return i<0?s:`<defs>${s.slice(0,i)}</defs>${s.slice(i+7)}`}

export { PAL, OPT, VB, LAYERS, RACE_DEF, BASE, PRESETS, avatarSvg };
