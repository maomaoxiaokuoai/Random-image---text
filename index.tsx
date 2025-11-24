import React, { useState, useEffect, useRef, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { RefreshCw, Loader2, Moon, Sun, WifiOff } from "lucide-react";

// --- Configuration ---

// Audio URL: Replace this with your uploaded file path (e.g., "./click.mp3") if you prefer a custom file.
// Leave empty to use the built-in subtle "Glass Tap" synthesizer.
const CLICK_SOUND_URL = ""; 

const IMG_APIS = [
  "https://t.alcy.cc/moez", // Original
  "https://t.alcy.cc/ycy",
  "https://t.alcy.cc/ai",
  "https://t.alcy.cc/fj",
  "https://t.alcy.cc/moe",
  "https://t.alcy.cc/pc"
];

const TEXT_API = "https://uapis.cn/api/v1/saying";
const BACKUP_API = "https://v1.hitokoto.cn"; // Reliable backup for Chinese quotes

// Fallback content in case all networks fail
const FALLBACK_QUOTES = [
  { content: "生活原本沉闷，但跑起来就有风。", author: "未知" },
  { content: "满地都是六便士，他却抬头看见了月亮。", author: "毛姆" },
  { content: "前程似锦，来日方长。", author: "未知" },
  { content: "热爱可抵岁月漫长。", author: "未知" },
  { content: "少年没有乌托邦，心向远方自明朗。", author: "未知" },
  { content: "凡是过去，皆为序章。", author: "莎士比亚" },
  { content: "星光不问赶路人，时光不负有心人。", author: "未知" },
  { content: "且视他人之疑目如盏盏鬼火，大胆地去走你的夜路。", author: "史铁生" }
];

// Kaomoji list (Yan Wen Zi) - Full Collection
const KAOMOJI = [
  "(*ﾟ∀ﾟ*)", "(ﾟ∀ﾟ)", "(`3´)", "(ゝ∀･)", "(ﾟ∀。)",
  "ξ( ✿＞◡❛)", "｡:.ﾟヽ(*´∀`)ﾉﾟ.:｡", "(´・ω・`)", "(つд⊂)", "(д) ﾟﾟ",
  "╮(╯_╰)╭", "(́◉◞౪◟◉‵)", "(σ′▽‵)′▽‵)σ", "。･ﾟ･(つд`ﾟ)･ﾟ･", "(`・ω・´)",
  "(／‵Д′)／~ ╧╧", "ლ(・´ｪ`・ლ)", "=͟͟͞͞( •̀д•́)", "σ ﾟ∀ ﾟ) ﾟ∀ﾟ)σ", "(◔⊖◔)つ",
  "(́=◞౪◟=‵)", "(´◓Д◔`)", "(´⊙ω⊙`)", "(*´･д･)?", "(´▽`ʃ♡ƪ)\"",
  "_(:3 ⌒ﾞ)_", "( ﾟ∀ﾟ)o彡ﾟ", "(´;ω;`)", "ﾚ(ﾟ∀ﾟ;)ﾍ=З=З=З", "(●´ω｀●)ゞ",
  "ε≡(ノ´＿ゝ｀）ノ", "(≧∀≦)ゞ", "( 3ω3)", "(●б人<●)", "σ(´∀｀*)",
  "(*´з｀*)", "(›´ω`‹ )", "(´・ω・)つ旦", "( ´∀｀)つt[ ]", "( ×ω× )",
  "(´～`)", "(・∀・)つ⑩", "(｡•ㅅ•｡)♡", "ρ(・ω・、)", "(∩^o^)⊃━☆ﾟ.*･｡",
  "..._〆(°▽°*)", "|Д`)ノ⌒●～*", "∑(ι´Дン)ノ", "ε≡ﾍ( ´∀`)ﾉ", "ヾ(●゜▽゜●)♡",
  "(ﾟω´)", "(・`ω´・)", "(ง๑ •̀_•́)ง", "( ˘•ω•˘ )◞⁽˙³˙⁾", "(・ε・)",
  "(=´ω`=)", ",,Ծ‸Ծ,,", "(*ﾟーﾟ)", "＼(●´ϖ`●)／", "ᕦ(ò_óˇ)ᕤ",
  "( ´Д`)y━･~~", "(っ´ω`c)", "ʅ（´◔౪◔）ʃ", "(•ㅂ•)/", "(≖ᴗ≖๑)",
  "(*´д`)", "||Φ|(|´|Д|`|)|Φ||", "(✘﹏✘ა)", "(　˙灬˙　)", "(＊゜ー゜)b",
  "Zz(´-ω-`*)", "( *´◒`*)", "ฅ(๑*д*๑)ฅ!!", "( ¤̴̶̷̤́ ‧̫̮ ¤̴̶̷̤̀ )", "（´-`）.｡oO",
  "ლ( • ̀ω•́ )っ", "(´-ω-｀)", "(っ●ω●)っ", "( *¯ ³¯*)♡ㄘゅ", "(｡・ω・｡)",
  "٩(๑´3｀๑)۶", "< (￣︶￣)>", "( •́ὤ•̀)", "(´∩ω∩｀)", "(●⁰౪⁰●)",
  "(づ′▽`)づ", "ヾ(*´∀ ˋ*)ﾉ", "ヽ( ^ω^ ゞ )", "(・ω・)", "(ﾟдﾟ)",
  "ಥ_ಥ", "(´･ω･`)", "ヽ(￣■￣)ゝ", "(・∀・)", "[̲̅$̲̅(̲̅ ͡° ͜ʖ ͡°̲̅)̲̅$̲̅]",
  "٩(•ิ˓̭ •ิ )ง", "(*´Д`)つ))´∀`)", "(^u^)", "(*‘ v`*)", "(*´ω`)人(´ω`*)",
  "d(`･∀･)b", "(,,・ω・,,)", "(｡A｡)", "(^y^)", "d(d＇∀＇)",
  "(ﾉ>ω<)ﾉ", "(*’ｰ’*)", "(^_っ^)", "(*´∀`)~♥", "_(:3 」∠ )_",
  "ヾ(；ﾟ(OO)ﾟ)ﾉ", "ლ｜＾Д＾ლ｜", "(｡◕∀◕｡)", "ヽ(́◕◞౪◟◕‵)ﾉ", "(ﾟ3ﾟ)～♪",
  "ヽ(✿ﾟ▽ﾟ)ノ", "థ౪థ", "(✪ω✪)", "(⁰▿⁰)", "ლ(╹◡╹ლ)",
  "･*･:≡(　ε:)", "(๑´ڡ`๑)", "(๑´ㅂ`๑)", "ε٩(๑> ₃ <)۶з", "(∂ω∂)",
  "ヽ(・×・´)ゞ", "☆⌒(*^-゜)v", "(灬ºωº灬)", "(๑• . •๑)", "(o´罒`o)",
  "(´///☁///`)", "( ^ω^)", "(❛◡❛✿)", "(ㅅ˘ㅂ˘)", "♥(´∀` )人",
  "٩(｡・ω・｡)﻿و", "(*ˇωˇ*人)", "(๑ơ ₃ ơ)♥", "☆^(ｏ´Ф∇Ф)o", "(๑´ㅁ`)",
  "(^ρ^)/", "(,,ﾟДﾟ)", "(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧", "o(☆Ф∇Ф☆)o", "( • ̀ω•́ )",
  "( ﾒ∀・)", "(￫ܫ￩)", "✧◝(⁰▿⁰)◜✧", "(( へ(へ´∀`)へ", "(๑•̀ㅂ•́)و✧",
  "( శ 3ੜ)～♥", "(♛‿♛)", "( ♥д♥)", "ヽ(㊤V㊤*)ﾉ", "(●｀ 艸 ´)",
  "(♡˙︶˙♡)", "(๑¯∀¯๑)", "Σ>―(〃°ω°〃)♡→", "ヾ(´ε`ヾ)", "٩(๑•̀ω•́๑)۶",
  "(((o(*ﾟ▽ﾟ*)o)))", "(▰˘◡˘▰)", "ヽ(●´ε｀●)ノ", "ヽ( ° ▽°)ノ", "(　ﾟ∀ﾟ) ﾉ♡",
  "(ゝ∀･)⌒☆", "(́순◞౪◟순‵)", "(╯°▽°)╯ ┻━┻", "(•‾⌣‾•)", "(*´д`)~♥",
  "ε(*´･∀･｀)зﾞ", "✧*｡٩(ˊᗜˋ*)و✧*｡", "(੭ु´ ᐜ `)੭ु⁾⁾", "⁽⁽ ◟(∗ ˊωˋ ∗)◞ ⁾⁾", "*ଘ(੭*ˊᵕˋ)੭* ੈ✩‧₊˚",
  "＼＼\\٩( 'ω' )و //／／", "ヾ(´︶`*)ﾉ♬", "(σﾟ∀ﾟ)σ..:*☆", "(⁎⁍̴̛ᴗ⁍̴̛⁎)‼", "(❀╹◡╹)",
  "（๑ • ‿ • ๑ ）", "⁽⁽ଘ( ˙꒳˙ )ଓ⁾⁾", "(๑•̀ω•́)ノ", "(๑ ^ ₃•๑)", "⁽⁽٩(๑˃̶͈̀ ᗨ ˂̶͈́)۶⁾⁾",
  "(ﾟ皿ﾟﾒ)", "(ﾒ ﾟ皿ﾟ)ﾒ", "(#`Д´)ﾉ", "(#`皿´)", "(-`ェ´-╬)",
  "(`д´)", "(╬ﾟдﾟ)", "ヽ(#`Д´)ﾉ", "(╬☉д⊙)", "⊙谷⊙",
  "ヽ(`Д´)ノ", "(╬ﾟдﾟ)▄︻┻┳═一", "٩(ŏ﹏ŏ、)۶", "(╬ﾟ ◣ ﾟ)", "(☄◣ω◢)☄",
  "(ಠ益ಠ)", "(ﾒﾟДﾟ)ﾒ", "(#ﾟ⊿`)凸", "(`へ´≠)", "(*≥▽≤)ツ┏━┓",
  "(๑•ૅω•´๑)", "눈言눈", "(╯•̀ὤ•́)╯", "(； ･`д･´)", "•_ゝ•",
  "( ･᷄ὢ･᷅ )", "(༼•̀ɷ•́༽)", "(╬ﾟдﾟ)╭∩╮", "٩(◦`꒳´◦)۶", "(ノ▼Д▼)ノ",
  "(ꐦ°᷄д°᷅)", "(〃∀〃)", "σ`∀´)σ", "(¦3[▓▓]", "(శωశ)",
  "(◔౪◔)", "☝( ◠‿◠ )☝", "(´≖◞౪◟≖)", "(<ゝω・) 綺羅星☆", "m9(＾Д＾)ﾌﾟｷﾞｬｰ",
  "( σ՞ਊ ՞)σ", "ლ(́◕◞౪◟◕‵ლ)", "(◕ܫ◕)", "(´ΘωΘ`)", "( ิ◕㉨◕ ิ)",
  "_(¦3」∠)_", "( ～'ω')～", "(　′∀`)σ≡σ☆))Д′)", "(́提◞౪◟供‵)", "(꒪ͦᴗ̵̍꒪ͦ )",
  "(｢･ω･)｢", "(❁´ω`❁)*✲ﾟ*", "=└(┐卍^o^)卍", "ヾ(*ΦωΦ)ツ", "◝(　ﾟ∀ ﾟ )◟",
  "◥(ฅº￦ºฅ)◤", "ᕕ ( ᐛ ) ᕗ", "(//´/◒/`//)", "( ´థ౪థ）σ", "(◍•ᴗ•◍)ゝ",
  "(☞ﾟ∀ﾟ)ﾟ∀ﾟ)☞", "₍₍◝(･'ω'･)◟⁾⁾", "(╯⊙ ⊱ ⊙╰ )", "(΄◞ิ౪◟ิ‵)", "(´◓ｑ◔｀)",
  "ಠ౪ಠ", "ૢ(⁎❝᷀ົཽω ❝᷀ົཽ⁎)✧", "ヾ(⌒(ﾉｼ'ω')ﾉｼ", "ლ（╹ε╹ლ）", "( ΄◞ิ .̫.̫ ◟ิ‵)",
  "(☝ ՞ਊ ՞）☝", "( ε:)⌒ﾞ(.ω.)⌒ﾞ(:3 )", "ψ(｀∇´)ψ", "( ͡o ͜ʖ ͡o)", "(๑╹◡╹๑)",
  "(͡ ͡° ͜ つ ͡͡°)", "ᕙ(˵ ಠ ਊ ಠ ˵)ᕗ", "∠( ᐛ 」∠)_", "⎝(◕u◕)⎠", "ﾚ(ﾟ∀ﾟ;)ﾍ　ﾍ( ﾟ∀ﾟ;)ﾉ",
  "⎝( OωO)⎠", "(*°ω°*ฅ)*", "(╯✧∇✧)╯", "⸜(* ॑꒳ ॑* )⸝", "⁄(⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄",
  "(〒︿〒)", "(つ´ω`)つ", "｡ﾟヽ(ﾟ´Д`)ﾉﾟ｡", "⊂彡☆))д`)", "ヾ(;ﾟ;Д;ﾟ;)ﾉﾞ",
  "இдஇ", "(´Ａ｀。)", "(´;ω;`)ヾ(･∀･`)", "｡ﾟ(ﾟ´ω`ﾟ)ﾟ｡", "(╥﹏╥)",
  ":;(∩´﹏`∩);:", "ΩДΩ", "(☍﹏⁰)", "( ´•̥̥̥ω•̥̥̥` )", "(;´༎ຶД༎ຶ`)",
  "( ´•̥×•̥` )", "(☍﹏⁰。)", "༼ ༎ຶ ෴ ༎ຶ༽", "(ﾟд⊙)", "(‘⊙д-)",
  "(☉д⊙)", "Σ(*ﾟдﾟﾉ)ﾉ", "(((ﾟДﾟ;)))", "(((ﾟдﾟ)))", "(ﾟдﾟ≡ﾟдﾟ)",
  "(|||ﾟдﾟ)", "Σ( ° △ °)", "Σ(ﾟДﾟ；≡；ﾟдﾟ)", "( ºΔº )", "Σ(;ﾟдﾟ)",
  "(●▼●;)", "┌|◎o◎|┘", "ε=ε=ヾ(;ﾟдﾟ)/", "(⁰⊖⁰)", "(°ﾛ°٥)",
  "＼(●o○;)ノ", "Σヽ(ﾟД ﾟ; )ﾉ", "Σ(°Д°;", "∑(￣□￣;)", "∑(✘Д✘๑ )",
  "δ△δ", "( ºωº )", "ㅇㅅㅇ", "(┛`д´)┛", "( ╯' - ')╯ ┻━┻",
  "(╯°Д°)╯ ┻━┻", "(╯°O°)╯┻━┻", "┳━┳ノ( OωOノ)", "┳━┳ノ( ' - 'ノ)", "┬─┬ ノ( ' - 'ノ)",
  "（ ´☣///_ゝ///☣｀）", "(*´艸`*)", "(ﾉ∀`*)", "(´,,•ω•,,)♡", "(◕ H ◕)",
  "( ´･ω)", "(,,Ծ 3 Ծ,,)", "|柱|ωﾟ)---c<` дﾟ)!", "|柱|ω・`)", "(´ﾟдﾟ`)",
  "( ˘•ω•˘ )", "( ˘･з･)", "(｡ŏ_ŏ)", "(눈‸눈)", "(｡>﹏<)哈啾",
  "(◜◔。◔◝)", "(　´・◡・｀)", "(ㆀ˘･з･˘)", "ヾ(◎´・ω・｀)ノ", "(´c_`)",
  "Σ(｀L_｀ )", "-//(ǒ.ǒ)//-", "(´,_ゝ`)", "(´_ゝ`)", "-`д´-",
  "(๑•́ ₃ •̀๑)", "_(┐「ε:)_", "(´-ι_-｀)", "＿ﾉ乙(､ﾝ､)＿", "(ﾟ⊿ﾟ)",
  "(　◜◡‾)", "(´･_･`)", "(ㆆᴗㆆ)", "(‾◡◝　)", "┐(´д`)┌",
  "( º﹃º )", "（’へ’）", "(◞‸◟)", "(´σ-`)", "(ヾﾉ･ω･`)",
  "ლ(´•д• ̀ლ", "ლ(◉◞౪◟◉ )ლ", "_(┐「﹃ﾟ｡)_", "ლ(╯⊙ε⊙ლ╰)", "╮(′～‵〞)╭",
  "( ´ﾟДﾟ`)", "(≖＿≖)✧", "(｡-_-｡)", "ƪ(•̃͡ε•̃͡)∫", "(ノ〠_〠)",
  "¯\\_(ツ)_/¯", "( ¯•ω•¯ )", "( •́ _ •̀)？", "(=m=)", "(･ω´･ )",
  "(;ﾟдﾟ)", "( ◕‿‿◕ )", "ಠ_ಠ", "(ΦωΦ)", "◑▂◐",
  "(΄ಢ◞౪◟ಢ‵)◉◞౪◟◉)", "(✺ω✺)", "(´◉‿◉｀)", "( ͡ʘ ͜ʖ ͡ʘ)", "(̿▀̿ ̿Ĺ̯̿̿▀̿ ̿)̄",
  "･ิ≖ ω ≖･ิ✧", "ㅍ_ㅍ", "༼ ºل͟º ༽", "(๑•ั็ω•็ั๑)", "(o´・ω・`)σ)Д`)",
  "(╭☞•́⍛•̀)╭☞", "( ﾟДﾟ)σ", "(´・Å・`)", "ﾟÅﾟ)", "Σ(ﾟωﾟ)",
  "Σ(ﾟдﾟ)", "(゜皿。)", "( ˘•ω•˘ ).oOஇ", "Σ(lliдﾟﾉ)ﾉ", "( ͡° ͜ʖ ͡ °)",
  "( ͡° ͜ʖ ͡°)", "<(_ _)>", "(′゜ω。‵)", "m(｡≧ｴ≦｡)m", "(シ_ _)シ",
  "(っ・Д・)っ", "( ￣ 3￣)y▂ξ", "(◓Д◒)✄╰⋃╯", "´-ω-)b", "(`┌_┐´)",
  "ԅ(¯﹃¯ԅ)", "（´◔​∀◔`)", "(//´◜◞⊜◟◝｀////)", "(/ ↀ3ↀ)/q(﹌ω﹌ )", "ლ(•ω •ლ)",
  "(´-ωก`)", "┏┛學校┗┓λλλλλ", "(　ᐛ)パァ", "( ･ิω･ิ)", "༼ つ◕_◕ ༽つ",
  "（¯﹃¯）", "ᕙ༼ຈل͜ຈ༽ᕗ", "ლ(ﾟдﾟლ)", "╮(╯∀╰)╭", "(ゝ∀･)b",
  "(｡･㉨･｡)", "( ‘д‘⊂彡☆))Д´)", "魔貫光殺砲(ﾟДﾟ)σ━00000000000━●", "( ´･･)ﾉ(._.`)", "Σ Σ Σ (」○ ω○ )／",
  "๛ก(ｰ̀ωｰ́ก)", "龜派氣功(ﾟДﾟ)< ============O))", "＼(・ω・＼)SAN値！(／・ω・)／ピンチ！", "(」・ω・)」SAN値！(／・ω・)／ピンチ！", "─=≡Σ((( つ•̀ω•́)=c＜一ω<))",
  "༼ つ ◕_◕ ༽つ", "ヽ(゜▽゜ )－C<(/;◇;)/~", "๛ก（ーωーก）", "( ՞ټ՞)", "（´◔ ₃ ◔`)",
  "(╭￣3￣)╭♡", "╭∩╮( ͡⚆ ͜ʖ ͡⚆)╭∩╮", "ᕕ༼ ͠ຈ Ĺ̯ ͠ຈ ༽┌∩┐", "(◉３◉)", "(´;;◉;⊖;◉;;｀)",
  "_:(´□`」 ∠):_", "_(√ ζ ε:)_", "_(°ω°｣ ∠)", "ヽ(=^･ω･^=)丿", "( Φ ω Φ )",
  "0(:3　)～ ('､3_ヽ)_", "(=´ᴥ`)", "Φ౪Φ", "ฅ●ω●ฅ", "┌(┌^o^)┐",
  "(￣ε(#￣)☆", "(❍ᴥ❍ʋ)", "(•ө•)", "( ఠൠఠ )ﾉ", "(o･e･)",
  "ก็ʕ•͡ᴥ•ʔ ก้", "( ﾟ Χ ﾟ)", "(:◎)≡", "(･8･)", "( ˊ̱˂˃ˋ̱ )",
  "(=^-ω-^=)", "⧸⎩⎠⎞͏(・∀・)⎛͏⎝⎭⧹", "(°ཀ°)", "⋉(● ∸ ●)⋊", "(ﾟ々｡)",
  "_(´ཀ`」 ∠)_", "(✧≖‿ゝ≖)", "_(┐ ◟;ﾟдﾟ)ノ", "◑ω◐", "／/( ◕‿‿◕ )＼",
  "( ಠ ͜ʖರೃ)", "┏( .-. ┏ ) ┓", "(っ﹏-) .｡o", "öㅅö", "┏(_д_┏)┓))",
  "(￣(エ)￣)", "(●｀･(ｴ)･´●)", "┏((＝￣(ｴ)￣=))┛", "(ó㉨ò)", "<*)) >>=<",
  "≧〔゜゜〕≦", "(:3[___]=", "(:3[__]4", "(ﾒ3[____]", "((└(:3」┌)┘))",
  "( ´(00)`)", "(｡í _ ì｡)", "( ☉_☉)≡☞o────★°", "O-(///￣皿￣)☞ ─═≡☆゜★█▇▆▅▄▃▂＿　", "美樹沙耶香 川▮ ㅂ ▮リ",
  "（ﾟДﾟ）σ弌弌弌弌弌弌弌弌弌弌弌弌弌弌弌弌弌弌弌弌⊃", "─=≡Σ(((っﾟДﾟ)っ", "(；´ﾟωﾟ｀人)", "(੭ ᐕ)੭？", "٩(♡ε♡ )۶",
  "(´∀｀)♡", "(༎ຶ⌑༎ຶ)", "(꒦໊ྀʚ꒦໊ི )", "(ꈨຶꎁꈨຶ)۶”", "(´-_ゝ-`)",
  "*｡٩(ˊωˋ*)و✧*｡", "（)´д`(）", "(´-εヾ )", "₍₍ ᕕ(´ ω` )ᕗ⁾⁾", "༼つ ் ▽ ் ༽つ",
  "⊂(・﹏・⊂)", "◟(ꉺᴗꉺ๑)◝", "⁽⁽◝( •ω• )◜⁾⁾", "₍₍ ◝(　ﾟ∀ ﾟ )◟ ⁾⁾♪", "♪┌| ﾟ皿ﾟ|┘♪",
  "~(‾▾‾~)", "ƪ(˘⌣˘)ʃ", "( ˘ ³˘)♥", "ʕ˶'༥'˶ʔ", "ʕ⸝⸝⸝˙Ⱉ˙ʔ",
  "(՞˶･･˶՞)", "( ˶ ❛ ꁞ ❛ ˶ )", "▼・ᴥ・▼", "⌓‿⌓", "(⸝⸝•̀֊•́⸝⸝)",
  "( ✌︎'ω')✌︎", "(˶‾᷄ ⁻̫ ‾᷅˵)", "(՞˶･֊･˶՞)", "ϵ( 'Θ' )϶", "٩(๑❛ᴗ❛๑)۶",
  "ʕ´• ᴥ•̥`ʔ", "(」・ω・)」うー！(／・ω・)／にゃー！", "─=≡Σ((( つ•̀ω•́)つ", "ｷﾀ━━━━(ﾟ∀ﾟ)━━━━!!", "il||li _|￣|○ヽ(･ω･｀)",
  "( ´∀`);y=ｰ(ﾟдﾟ)･∵. ﾀｰﾝ", "(´･д･｀)ﾊ(･д･｀*)", "(“￣▽￣)-o█ █o-(￣▽￣”)/", "(｡´∀｀)ﾉ―⊂ZZZ⊃", "(・∀・)ノ三G[__]ｺ",
  "⊂(°Д°⊂⌒｀つ≡≡≡(´⌒;;;≡≡≡", "( ・・)つ―{}@{}@{}-", "(ノ・＿・)ノ凹 ┣凹━凹━凹┫", "( ´-ω ･)▄︻┻┳══━", "。･ﾟ･(つд`ﾟ)つ⑩))Д´)",
  "ヽ(∀ﾟ )人(ﾟ∀ﾟ)人( ﾟ∀)人(∀ﾟ )人(ﾟ∀ﾟ)人( ﾟ∀)ﾉ", "(　ﾟ∀ﾟ)つ≡≡≡♡♡♡)`ν゜)ｸﾞｼｬ", "(ㄏ￣▽￣)ㄏ ㄟ(￣▽￣ㄟ)", "♡(*´∀｀*)人(*´∀｀*)♡", "。゜+.(人-ω◕)゜+.゜",
  "━(ﾟ∀ﾟ)━( ﾟ∀)━( ﾟ)━( )━( )━(ﾟ)━(∀ﾟ)━(ﾟ∀ﾟ)━", "◢▆▅▄▃ 溫╰(〞︶〝) ╯馨 ▃▄▅▆◣", "....ˊˋ------｡:.ﾟ_ヽ(_´∀`_)ﾉ_.:｡((浮水", "╮/(＞▽<)人(>▽＜)╭", "₍₍ ◝('ω'◝) ⁾⁾ ₍₍ (◟'ω')◟ ⁾⁾",
  "(╯‵□′)╯︵┴─┴", "◢▆▅▄▃崩╰(〒皿〒)╯潰▃▄▅▇◣", "（ ´ﾟ,_」ﾟ）ﾊﾞｶｼﾞｬﾈｰﾉ", "╯-____-)╯~═╩════╩═", "(╯ŏ益ŏ)╯︵(ヽo□o)ヽ",
  "(╬▼дﾟ)▄︻┻┳═一", "●｀ε´●)爻(●｀ε´● )", "(┐「ε:)_三┌(.ω.)┐三_(:3 」∠)_", "‹‹\( ˙▿˙　)/››‹‹\(　˙▿˙ )/››", "‹‹\(´ω` )/››‹‹\( 　´)/››‹‹\( ´ω`)/››",
  "・゜・(PД`q｡)・゜・", "(ｏﾟﾛﾟ)┌┛Σ(ﾉ´*ω*`)ﾉ", "｡･ﾟ･(ﾉД`)ヽ(ﾟДﾟ )秀秀", "L(　；ω；)┘三└(；ω；　)」", "(;◉∀◉)オッ(∀◉)◉ハッ(;∀)◉◉ヨｫー!!!",
  "(　◞≼☸≽◟ ._ゝ◞≼☸≽◟)", "(;´д｀).｡ｏO(・・・・)", "(σ回ω・)σ←↑→↓←↑", "|////|　( 　)ﾉ　|////|(自動門", "(=ﾟДﾟ=) ▄︻┻┳━ ·.`.`.`.",
  "(:3っ)へ ヽ(´Д｀●ヽ)", "(´д((☆ミPia!⊂▼(ｏ ‵－′ｏ)▼つPia!彡★))∀`)", "d(・ω・d) 微分！(∫・ω・)∫ 積分！∂(・ω・∂) 偏微分！(∮・ω・)∮ 沿閉曲線的積分！(∬・ω・)∬ 重積分！∇(・ω・∇)梯度！∇・(・ω・∇・)散度！∇×(・ω・∇×)旋度！Δ(・ω・Δ)拉普拉斯！", "~(～o￣▽￣)～o.....o～(＿△＿o～)~..", "( ￣□￣)/ 敬禮!! <(￣ㄧ￣ ) <(￣ㄧ￣ )",
  "ξ( ✿＞◡❛)▄︻▇▇〓▄︻┻┳═一", "(´>∀)人(´・ω・)ﾉヽ(・ε・*)人(-д-`)", ": ♡｡ﾟ.(*♡´◡` 人´◡` ♡*)ﾟ♡ °・", "(〃￣ω￣)人(￣︶￣〃)", "どこ━━━━(゜∀゜三゜∀゜)━━━━!!??",
  "#ﾟÅﾟ）⊂彡☆))ﾟДﾟ)･∵", "（つ> _◕）つ︻╦̵̵͇̿̿̿̿╤───", "༼ つ/̵͇̿̿/’̿’̿ ̿ ̿̿ ̿̿◕ _◕ ༽つ/̵͇̿̿/’̿’̿ ̿ ̿̿ ̿̿ ̿̿", "ヽ(゜▽゜　)－C<(/;◇;)/~[拖走]", "( ￣□￣)σ 論破!! ︴≡║██言彈██》",
  "ヾ(:3ﾉｼヾ)ﾉｼ 三[____]", "(#‵)3′)▂▂▂▃▄▅～～～嗡嗡嗡嗡嗡"
];

interface ThemeVariant {
  id: string;
  fontFamily: string;
  accentColor: string;
}

// Separated from color scheme to allow light/dark mode toggling
const THEME_VARIANTS: ThemeVariant[] = [
  {
    id: "classic",
    fontFamily: "'Noto Serif SC', serif",
    accentColor: "#d4a373",
  },
  {
    id: "ink",
    fontFamily: "'Long Cang', cursive",
    accentColor: "#ef4444",
  },
  {
    id: "modern",
    fontFamily: "'Inter', sans-serif",
    accentColor: "#38bdf8",
  }
];

interface QuoteData {
  content: string;
  author: string;
  isFallback?: boolean;
}

const App = () => {
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  // Dual-layer background system for smooth cross-fading
  const [bgLayers, setBgLayers] = useState<{ [key: number]: string }>({ 1: "", 2: "" });
  const [activeLayer, setActiveLayer] = useState<1 | 2>(1);
  
  const [currentKaomoji, setCurrentKaomoji] = useState<string>(KAOMOJI[0]);
  const [currentVariant, setCurrentVariant] = useState<ThemeVariant>(THEME_VARIANTS[0]);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);
  
  // Use a ref for AudioContext to reuse it across clicks (Browser Limit Optimization)
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Ref to hold the promise of the NEXT background image for speculative preloading
  const nextBgPromiseRef = useRef<Promise<string> | null>(null);

  // Derived style based on current theme variant and dark mode state
  const currentStyle = {
    fontFamily: currentVariant.fontFamily,
    accentColor: currentVariant.accentColor,
    textColor: isDarkMode ? "#ffffff" : "#1a1a1a",
    overlayColor: isDarkMode ? "rgba(0, 0, 0, 0.25)" : "rgba(255, 255, 255, 0.25)",
    borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    shadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    textShadow: isDarkMode 
      ? "0 2px 8px rgba(0,0,0,0.8)" 
      : "0 0 12px rgba(255,255,255,0.8), 0 0 5px rgba(255,255,255,1)"
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Helper to generate a unique random API URL to bypass cache
  const getRandomBgUrl = useCallback(() => {
    const randomApi = IMG_APIS[Math.floor(Math.random() * IMG_APIS.length)];
    return `${randomApi}?t=${Date.now()}`;
  }, []);

  // Performance: Optimized preloader that returns the URL
  const preloadImageTask = useCallback((url: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      const onReady = () => resolve(url);
      if (img.decode) {
        img.decode().then(onReady).catch(() => resolve(url));
      } else {
        img.onload = onReady;
        img.onerror = onReady; 
      }
    });
  }, []);

  // Speculative Loading: Queue the NEXT image in the background
  const queueNextImage = useCallback(() => {
    const nextUrl = getRandomBgUrl();
    nextBgPromiseRef.current = preloadImageTask(nextUrl);
  }, [getRandomBgUrl, preloadImageTask]);

  const playClickSound = useCallback(() => {
    // If a custom file is provided, use it
    if (CLICK_SOUND_URL) {
      try {
        const audio = new Audio(CLICK_SOUND_URL);
        audio.volume = 0.4;
        audio.play().catch(err => console.warn("Audio file playback failed:", err));
        return;
      } catch (e) {
        console.error("Audio setup failed", e);
      }
    }

    // Default: Web Audio API "Glass Tap" Synthesizer
    // Optimized: Reuse AudioContext to prevent running out of contexts
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }

      const ctx = audioCtxRef.current;
      
      // Resume context if suspended (browser requirement for user gesture)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      
      // Glass tap sound synthesis
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(880, now); // A5 note, pleasant high pitch
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.1); // Slight pitch bend up for "ping" effect
      
      gain.gain.setValueAtTime(0.05, now); // Very low volume (subtle)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15); // Fast decay

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      // Fail silently if Web Audio is not supported
    }
  }, []);

  const fetchQuoteWithFallback = useCallback(async (): Promise<QuoteData> => {
    // Define Fetcher for Primary API
    const fetchPrimary = async (): Promise<QuoteData> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); 
      
      const response = await fetch(`${TEXT_API}?t=${Date.now()}`, { 
        signal: controller.signal,
        cache: 'no-store',
        mode: 'cors'
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error("Primary API Error");
      const json = await response.json();
      
      let content = "";
      let author = "未知";
      
      if (json.data && typeof json.data === 'object') {
          content = json.data.content || json.data.saying;
          author = json.data.author || author;
      } else if (json.content) {
          content = json.content;
          author = json.author || author;
      }
      
      if (!content) throw new Error("Primary API Empty");
      return { content, author };
    };

    // Define Fetcher for Backup API
    const fetchBackup = async (): Promise<QuoteData> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(`${BACKUP_API}?t=${Date.now()}`, { 
        signal: controller.signal,
        cache: 'no-store'
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error("Backup API Error");
      const json = await response.json();
      
      if (!json.hitokoto) throw new Error("Backup API Empty");
      return {
        content: json.hitokoto,
        author: json.from_who || json.from || "未知"
      };
    };

    // Helper for Promise.any behavior to avoid TS target issues (ES2021+)
    const promiseAny = <T,>(promises: Promise<T>[]): Promise<T> => {
      return new Promise((resolve, reject) => {
        let errors: any[] = [];
        let rejectedCount = 0;
        
        if (promises.length === 0) return reject(new Error("No promises"));

        promises.forEach((p, idx) => {
          Promise.resolve(p)
            .then(resolve)
            .catch(error => {
              errors[idx] = error;
              rejectedCount++;
              if (rejectedCount === promises.length) {
                reject(new Error("All promises rejected"));
              }
            });
        });
      });
    };

    try {
      // Use custom promiseAny to return the first successful promise (Fastest Success)
      // This runs both requests in parallel and resolves as soon as one succeeds.
      return await promiseAny([fetchPrimary(), fetchBackup()]);
    } catch (aggregateError) {
      console.warn("All network requests failed:", aggregateError);
      const fallback = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
      return { ...fallback, isFallback: true };
    }
  }, []);

  const refreshAll = useCallback(async () => {
    // Prevent double clicking
    if (loading) return;
    
    // Play sound on click (Instant feedback)
    playClickSound();

    setLoading(true);
    
    try {
      // Determine which layer should receive the next image
      let targetLayer: 1 | 2 = 1;
      setActiveLayer(prev => {
        targetLayer = prev === 1 ? 2 : 1;
        return prev; // Don't change active layer yet
      });

      // Generate new states
      let nextKaomoji;
      let attempts = 0;
      do {
        nextKaomoji = KAOMOJI[Math.floor(Math.random() * KAOMOJI.length)];
        attempts++;
      } while (nextKaomoji === currentKaomoji && KAOMOJI.length > 1 && attempts < 5);
      
      const randomVariant = THEME_VARIANTS[Math.floor(Math.random() * THEME_VARIANTS.length)];

      // 1. Fetch Text with Retry Logic (Async Promise)
      const textFetchPromise = (async () => {
         let textData: QuoteData = { content: "", author: "" };
         let textAttempts = 0;
         const maxTextAttempts = 5;

         do {
           const newData = await fetchQuoteWithFallback();
           
           if (!newData.content) {
              textAttempts++;
              continue;
           }
           
           // Optimization: Retry if content is exactly the same as current
           if (quoteData && newData.content === quoteData.content && textAttempts < maxTextAttempts) {
                textAttempts++;
                continue;
           }

           return newData; 
         } while (textAttempts < maxTextAttempts);
         
         return textData || { ...FALLBACK_QUOTES[0], isFallback: true };
      })();

      // 2. Resolve Image Promise (Use Buffered or Start New)
      const imageFetchPromise = nextBgPromiseRef.current 
          ? nextBgPromiseRef.current 
          : preloadImageTask(getRandomBgUrl());

      // 3. Wait for both promises to resolve
      // If the image was buffered, this is effectively instantaneous for the image part.
      const [textData, newBgUrl] = await Promise.all([textFetchPromise, imageFetchPromise]);

      if (isMounted.current) {
        // Set the background URL for the *hidden* layer
        setBgLayers(prev => ({ ...prev, [targetLayer]: newBgUrl }));
        
        // Switch visibility to the new layer (Cross-fade)
        setActiveLayer(targetLayer);
        
        setQuoteData(textData);
        setCurrentKaomoji(nextKaomoji);
        setCurrentVariant(randomVariant);
        
        // 4. Speculative Preload: Immediately queue the NEXT image for the subsequent click
        // This ensures the next refresh will be fast.
        queueNextImage();
      }

    } catch (err) {
      console.error("Unexpected error in refreshAll", err);
      if (isMounted.current) {
         setQuoteData({ ...FALLBACK_QUOTES[0], isFallback: true });
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [loading, currentKaomoji, quoteData, fetchQuoteWithFallback, playClickSound, queueNextImage, getRandomBgUrl, preloadImageTask]);

  useEffect(() => {
    refreshAll().then(() => {
        // Ensure queue is initialized after the first load
        if (!nextBgPromiseRef.current) queueNextImage();
    });
    
    // Cleanup AudioContext on unmount
    return () => { 
      isMounted.current = false; 
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []); // Run once on mount

  return (
    <div 
      style={{ 
        position: "relative", 
        width: "100vw", 
        height: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        overflow: "hidden", 
        backgroundColor: "#000" 
      }}
    >
      {/* Background Layer 1 */}
      <div 
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: bgLayers[1] ? `url(${bgLayers[1]})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: activeLayer === 1 ? 1 : 0,
          transition: "opacity 0.8s ease-in-out", // Smooth cross-fade
          zIndex: 0,
          willChange: "opacity"
        }}
      />
      
      {/* Background Layer 2 */}
      <div 
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: bgLayers[2] ? `url(${bgLayers[2]})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: activeLayer === 2 ? 1 : 0,
          transition: "opacity 0.8s ease-in-out", // Smooth cross-fade
          zIndex: 0,
          willChange: "opacity"
        }}
      />

      {/* Main Card */}
      <main 
        style={{
          position: "relative",
          zIndex: 10,
          width: "min(90%, 420px)",
          padding: "2rem 1.25rem",
          borderRadius: "20px",
          backgroundColor: currentStyle.overlayColor,
          backdropFilter: "blur(2px)",
          boxShadow: currentStyle.shadow,
          border: `1px solid ${currentStyle.borderColor}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          color: currentStyle.textColor,
          transition: "all 0.5s ease"
        }}
      >
        {/* Toggle Theme Button */}
        <button
          onClick={toggleTheme}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: currentStyle.textColor,
            opacity: 0.6,
            transition: "all 0.3s ease",
            padding: "5px"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.transform = "rotate(15deg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "0.6";
            e.currentTarget.style.transform = "rotate(0deg)";
          }}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Top Symbol: Kaomoji */}
        <div 
          style={{ 
            fontFamily: "'Inter', 'Segoe UI', 'Apple Color Emoji', sans-serif",
            fontSize: "1.5rem", 
            color: currentStyle.accentColor,
            marginBottom: "1rem",
            lineHeight: 1.4,
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            transition: "color 0.5s ease",
            width: "100%",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            padding: "0 4px",
            boxSizing: "border-box"
          }}
          title={currentKaomoji}
        >
          {currentKaomoji}
        </div>

        {/* Content Area */}
        <div style={{ minHeight: "80px", display: "flex", flexDirection: "column", justifyContent: "center", width: "100%" }}>
          {!quoteData ? (
             <Loader2 className="animate-spin" size={24} style={{ margin: "auto", opacity: 0.6 }} />
          ) : (
            <div key={quoteData.content} style={{ width: "100%" }}>
              <h1 
                style={{ 
                  margin: "0 0 0.75rem 0", 
                  fontFamily: currentStyle.fontFamily,
                  fontSize: "clamp(1.1rem, 4vw, 1.5rem)", 
                  lineHeight: 1.5,
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  textShadow: currentStyle.textShadow,
                  opacity: 0,
                  animation: "blurIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards"
                }}
              >
                {quoteData.content}
              </h1>
              
              {quoteData.author && quoteData.author !== "未知" && (
                 <div 
                   style={{ 
                     width: "100%", 
                     display: "flex", 
                     justifyContent: "flex-end",
                     alignItems: "center",
                     marginTop: "0.25rem",
                     opacity: 0,
                     animation: "blurIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards 0.15s"
                   }}
                 >
                   <span 
                    style={{
                      fontFamily: currentStyle.fontFamily,
                      fontSize: "0.85rem",
                      opacity: 0.95,
                      borderBottom: `2px solid ${currentStyle.accentColor}`,
                      paddingBottom: "2px",
                      textShadow: currentStyle.textShadow
                    }}
                   >
                     —— {quoteData.author}
                   </span>
                   {quoteData.isFallback && (
                    <span 
                      title="Network unavailable, showing offline content" 
                      style={{ 
                        marginLeft: '8px', 
                        opacity: 0.6, 
                        display: "inline-flex",
                        color: currentStyle.accentColor 
                      }}
                    >
                      <WifiOff size={14} />
                    </span>
                   )}
                 </div>
              )}
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <button
          onClick={refreshAll}
          disabled={loading}
          style={{
            marginTop: "1.25rem",
            background: loading ? "rgba(255,255,255,0.05)" : "transparent",
            border: `1px solid ${currentStyle.textColor}`,
            color: currentStyle.textColor,
            padding: "8px 20px",
            borderRadius: "999px",
            cursor: loading ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.85rem",
            transition: "all 0.3s ease",
            opacity: loading ? 0.7 : 0.9,
            textShadow: isDarkMode ? "0 1px 2px rgba(0,0,0,0.5)" : "none",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background = currentStyle.accentColor;
              e.currentTarget.style.borderColor = currentStyle.accentColor;
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.textShadow = "none";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = currentStyle.textColor;
              e.currentTarget.style.color = currentStyle.textColor;
              e.currentTarget.style.opacity = "0.9";
              e.currentTarget.style.textShadow = isDarkMode ? "0 1px 2px rgba(0,0,0,0.5)" : "none";
            }
          }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>{loading ? "加载中..." : "换一句"}</span>
        </button>
      </main>
      <style>{`
        @keyframes blurIn {
          0% {
            opacity: 0;
            transform: translateY(15px);
            filter: blur(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }
      `}</style>
    </div>
  );
};

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}