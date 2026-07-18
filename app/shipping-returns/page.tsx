export default function ShippingReturnsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-5xl font-semibold text-center">Shipping &amp; Returns</h1>

      <h2 className="mt-8 text-xl font-medium">Shipping Policy</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        We offer free shipping on all orders of $150 or greater. For orders
        under $100, we offer a flat rate of $12. Shipping times may vary
        depending on your location and the shipping method selected. If you
        have any questions or concerns, please don&apos;t hesitate to
        contact us.
      </p>

      <h2 className="mt-8 text-xl font-medium">Return &amp; Exchange Policy</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Our aim is to ensure your complete satisfaction with your purchase.
        If you received a damaged or defective item, please contact us.
        Should items be defective, customers are responsible for return
        shipping costs. At this time, all sales are final.
      </p>
    </div>
  );
}

