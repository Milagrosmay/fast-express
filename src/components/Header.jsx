export default function Header({ setVista, setCotizacionDetalle }) {
  const base =
    "cursor-pointer rounded-md px-4 py-2 text-lg text-black transition hover:bg-slate-800 hover:text-white hover:shadow-lg focus:bg-slate-800 focus:text-white focus:shadow-lg";

  return (
    <div className="bg-linear-to-r from-cyan-200 to-blue-400 flex items-center justify-between px-8 font-extrabold h-20 shadow-sm">
      <div className="flex items-center gap-2 text-2xl text-slate-800">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="60px"
          viewBox="0 -960 960 960"
          width="60px"
          fill="#31607d"
        >
          <path d="M188-196q-32-36-27-85H61l13-60h112q15-18 36.5-28.5T270-380q26 0 47.5 10.5T354-341h198l92-399H266l13-60h440l-39 170h125l114 152-39 197h-80q5 49-27.5 85T690-160q-50 0-82-36t-27-85H380q5 49-27.5 85T270-160q-50 0-82-36Zm446-234h215l6-33-80-107H666l-32 140Zm10-310-92 399 8-36 84-363ZM140-447v-113H60l120-192v112h80L140-447Zm130 227q21 0 35.5-15t14.5-35q0-21-14.5-35.5T270-320q-20 0-35 14.5T220-270q0 20 15 35t35 15Zm420 0q21 0 35.5-15t14.5-35q0-21-14.5-35.5T690-320q-20 0-35 14.5T640-270q0 20 15 35t35 15Z" />
        </svg>
        <span className="hidden md:inline">FastExpress</span>
      </div>

      <div className="flex items-center gap-4">
        <button
          className={base}
          onClick={() => {
            setCotizacionDetalle(null);
            setVista(1);
          }}
        >
          Cotizaciones
        </button>
        <button
          className={base}
          onClick={() => {
            setCotizacionDetalle(null);
            setVista(2);
          }}
        >
          Formulario
        </button>
      </div>
    </div>
  );
}
