/* CVNexa - app.js + Supabase */

const SUPABASE_URL = "https://mblhvvaqbcfcuaawpejf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_2pcWqpRdAzcDDs_4B3YfYA_QC7HCIVz";

const baseTemplates = [
  {id:"cv1",name:"Mariana",category:"Modern",price:50000,image:"images/cv-1.jpg"},
  {id:"cv2",name:"Professional Black",category:"Formal",price:50000,image:"images/cv-2.jpg"},
  {id:"cv3",name:"Emerald Professional",category:"Modern",price:55000,image:"images/cv-3.jpg"},
  {id:"cv4",name:"Sofia Blue",category:"Creative",price:60000,image:"images/cv-4.jpg"},
  {id:"cv5",name:"Colorful Creative",category:"Creative",price:65000,image:"images/cv-5.jpg"},
  {id:"cv6",name:"Portfolio Orange",category:"Creative",price:65000,image:"images/cv-6.jpg"},
  {id:"cv7",name:"Retro Professional",category:"Creative",price:60000,image:"images/cv-7.jpg"},
  {id:"cv8",name:"Influencer Creative",category:"Creative",price:70000,image:"images/cv-8.jpg"},
  {id:"cv9",name:"Purple Designer",category:"Modern",price:65000,image:"images/cv-9.jpg"},
  {id:"cv10",name:"Purple Illustrator",category:"Creative",price:65000,image:"images/cv-10.jpg"}
];


/* =========================
   SUPABASE
========================= */

let supabaseClient = null;

function initSupabase() {

  if (!window.supabase) {
    console.error("Library Supabase belum dimuat.");
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    );

    /* Supaya admin.html juga bisa mengaksesnya */
    window.supabaseClient = supabaseClient;
  }

  return supabaseClient;
}

initSupabase();


/* =========================
   UTILITAS
========================= */

function money(n) {
  return "Rp" + new Intl.NumberFormat("id-ID").format(n);
}

function esc(s = "") {
  return String(s).replace(/[&<>"']/g, function(m) {
    return {
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#039;"
    }[m];
  });
}


/* =========================
   TEMPLATE ONLINE
========================= */

let cloudTemplates = [];
let category = "Semua";

async function loadCustomTemplates() {

  const sb = initSupabase();

  if (!sb) {
    console.error("Supabase client tidak tersedia.");
    return [];
  }

  try {

    const { data, error } = await sb
      .from("cv_templates")
      .select("*")
      .order("created_at", { ascending:true });

    if (error) {
      console.error("Supabase error:", error);
      cloudTemplates = [];
      return [];
    }

    cloudTemplates = (data || []).map(function(t) {

      return {
        id: String(t.id),
        dbId: t.id,
        name: t.name,
        category: t.category,
        price: Number(t.price),
        image: t.image_url,
        storage_path: t.storage_path,
        custom: true
      };

    });

    return cloudTemplates;

  } catch (error) {

    console.error("Gagal mengambil template:", error);
    cloudTemplates = [];
    return [];

  }
}


async function getCustomTemplates() {
  return await loadCustomTemplates();
}


async function getAllTemplates() {

  const custom = await loadCustomTemplates();

  return [
    ...baseTemplates,
    ...custom
  ];

}


/* =========================
   FILTER KATEGORI
========================= */

function setCategory(c, el) {

  category = c;

  document
    .querySelectorAll(".chip")
    .forEach(function(x) {
      x.classList.remove("active");
    });

  el.classList.add("active");

  renderTemplates();

}


/* =========================
   TAMPILKAN TEMPLATE
========================= */

async function renderTemplates() {

  const grid = document.getElementById("grid");

  if (!grid) return;

  const search =
    document.getElementById("search");

  const q =
    search ?
    search.value.toLowerCase() :
    "";

  const all =
    await getAllTemplates();

  const data =
    all.filter(function(t) {

      return (

        (category === "Semua" ||
         t.category === category)

        &&

        (
          t.name.toLowerCase().includes(q)
          ||
          t.category.toLowerCase().includes(q)
        )

      );

    });


  const count =
    document.getElementById("count");

  if (count) {
    count.textContent =
      data.length + " template";
  }


  grid.innerHTML =
    data.map(function(t) {

      return `
      <article class="card">

        <div
          class="preview"
          onclick="openPreview('${t.id}')"
        >
          <img
            src="${t.image}"
            alt="${esc(t.name)}"
            loading="lazy"
          >
        </div>

        <div class="cardinfo">

          <div>
            <h2>${esc(t.name)}</h2>
            <p>${esc(t.category)}</p>
          </div>

          <strong>
            ${money(t.price)}
          </strong>

        </div>

        <button
          class="choose"
          onclick="chooseTemplate('${t.id}')"
        >
          Pilih Template →
        </button>

      </article>
      `;

    }).join("")

    ||

    `
    <div class="empty">
      <div>🔎</div>
      <h2>Template tidak ditemukan</h2>
    </div>
    `;

}


/* =========================
   PILIH TEMPLATE
========================= */

function chooseTemplate(id) {

  localStorage.setItem(
    "selected_template",
    id
  );

  location.href =
    "form.html?template=" +
    encodeURIComponent(id);

}


/* =========================
   PREVIEW
========================= */

async function openPreview(id) {

  const all =
    await getAllTemplates();

  const t =
    all.find(function(x) {
      return String(x.id) === String(id);
    });

  if (!t) return;


  const m =
    document.createElement("div");

  m.className = "modal";


  m.innerHTML = `

    <div class="modalbox">

      <button
        class="close"
        onclick="
          this.parentElement
          .parentElement
          .remove()
        "
      >
        ×
      </button>

      <img src="${t.image}">

      <h2>
        ${esc(t.name)}
      </h2>

      <p>
        ${esc(t.category)}
        •
        ${money(t.price)}
      </p>

      <button
        class="choose big"
        onclick="
          chooseTemplate('${t.id}')
        "
      >
        Pilih Template Ini
      </button>

    </div>

  `;

  document.body.appendChild(m);

}


/* =========================
   PESANAN WHATSAPP
========================= */

function sendOrder(o, t) {

  const msg =
`Halo Admin CVNexa 👋%0A%0A` +
`Saya ingin memesan jasa pembuatan CV.%0A%0A` +

`📄 TEMPLATE YANG DIPILIH%0A` +
`${t.name}%0A` +
`Kategori: ${t.category}%0A` +
`Harga: ${money(t.price)}%0A%0A` +

`👤 DATA PEMESAN%0A` +
`Nama: ${o.name}%0A` +
`WhatsApp: ${o.phone}%0A` +
`Email: ${o.email || "-"}%0A` +
`Alamat: ${o.address || "-"}%0A` +
`Posisi: ${o.position}%0A%0A` +

`🎓 PENDIDIKAN%0A` +
`${o.education}%0A%0A` +

`💼 PENGALAMAN KERJA%0A` +
`${o.experience}%0A%0A` +

`🛠️ SKILL%0A` +
`${o.skills}%0A%0A` +

`📝 TENTANG SAYA%0A` +
`${o.about || "-"}%0A%0A` +

`📌 CATATAN%0A` +
`${o.notes || "-"}%0A%0A` +

`Tolong dibuat mengikuti format template "${t.name}" yang saya pilih. Terima kasih.`;

  window.open(
    "https://wa.me/6285794859861?text=" + msg,
    "_blank"
  );

}


/* =========================
   KONTAK ADMIN
========================= */

function contactAdmin() {

  window.open(
    "https://wa.me/6285794859861?text=" +
    "Halo%20Admin%20CVNexa,%20saya%20ingin%20bertanya%20tentang%20jasa%20pembuatan%20CV.",
    "_blank"
  );

}


/* =========================
   JALANKAN DI INDEX
========================= */

if (
  document.getElementById("grid")
) {

  renderTemplates();

}
