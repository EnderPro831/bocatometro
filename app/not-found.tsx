import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container-main py-20 text-center">
      <div className="text-7xl mb-4 animate-pulse">🥖</div>
      <p className="font-display text-bocata-red text-sm font-bold uppercase tracking-widest mb-2">
        Error 404
      </p>
      <h1 className="font-display font-black text-5xl mb-3 text-bocata-dark dark:text-cream-50">
        Página no encontrada
      </h1>
      <p className="text-bocata-brown dark:text-cream-400 mb-8 max-w-sm mx-auto leading-relaxed">
        Esta página ha desaparecido misteriosamente. Como ese bocata que juraste que
        no ibas a terminar y terminaste.
      </p>
      <Link href="/" className="btn-primary">
        Volver al inicio
      </Link>
    </div>
  )
}
