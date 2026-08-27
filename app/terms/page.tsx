import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms of use, pricing, shipping, and copyright for the Bay Area Fire Store online shop.",
};

const terms = [
  "All users of this site agree that access to and use of this site are subject to the following terms and conditions and other applicable law. If you do not agree to these terms and conditions, please do not use this site.",
  "The entire content included in this site, including but not limited to text, graphics, photography, or code is copyrighted as a collective work under United States and other copyright laws, and is the property of Bay Area Fire Store.",
  "Bay Area Fire Store online shop, all rights reserved.",
  "Permission is granted to electronically copy and print hard copy portions of this site for the sole purpose of placing an order with Bay Area Fire Store or purchasing Bay Area Fire Store products. Any other use is strictly prohibited unless authorized by Bay Area Fire Store.",
  "In the event a product is mistakenly listed at an incorrect price, Bay Area Fire Store reserves the right to refuse or cancel any orders placed for that product, whether or not the order has been confirmed. If your card has already been charged, we will issue a credit or store credit for a different item.",
  "Bay Area Fire Store is not responsible for any lost or stolen packages. Please ensure all shipping addresses provided are correct. Tracking information is provided once an order is fulfilled and a label is printed.",
  "We are not responsible for additional customs fees that may be required when shipping internationally.",
  "All sales are final.",
];

export default function termsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Terms &amp; Conditions</h1>
      <ol className="mt-8 flex flex-col gap-4 text-sm text-zinc-600 dark:text-zinc-400">
        {terms.map((term, i) => (
          <li key={i}>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {i + 1}.
            </span>{" "}
            {term}
          </li>
        ))}
      </ol>

      <h2 className = "mt-10 text-3xl font-medium">Shipping Info</h2> 
      <p className = "mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        ORDERS ARE USUALLY SHIPPED WITHIN 5 BUSINESS DAYS, UNLESS STATED OTHERWISE 
        IN PRODUCT DESCRIPTION. PLEASE NOTE THAT ‘PREORDER ITEMS’ GENERALLY TAKE 
        3-4 WEEKS AND THE EXPECTED SHIPPING DATE WILL BE LISTED IN THE PRODUCTS 
        DESCRIPTION.
      </p>
      <p className = "mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        CERTAIN ITEMS ARE MADE-TO-ORDER SO IT MAY TAKE UP 2-3 WEEKS UNTIL TRACKING WILL BE AVAILABLE.
        UPS: 3-5 BUSINESS DAYS 
      </p>
      <p className = "mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        (DELAYS HAVE BEEN IMMINENT DUE TO COVID-19)
      </p>
      <p className = "mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        IT IS THE CUSTOMERS RESPONSIBILITY TO PROVIDE CORRECT BILLING AND SHIPPING 
        ADDRESS. WE WILL NOT REFUND OR REPLACE ORDERS THAT WERE SHIPPED TO AN INCORRECT 
        ADDRESS. IF ORDERS ARE UNDELIVERABLE TO THE PROVIDED ADDRESS AND IS RETURNED, 
        AN ADDITIONAL SHIPPING FEE WILL BE CHARGED TO RESHIP TO ANOTHER ADDRESS.
      </p>
      <p className = "mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        WE ARE NOT RESPONSIBLE FOR LOST/STOLEN PACKAGES.
      </p>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        WE ARE NOT RESPONSIBLE FOR ADDITIONAL CUSTOMS FEES WHEN SHIPPING INTERNATIONAL.
      </p>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        ONCE YOUR ORDER HAS BEEN PACKED, YOU WILL RECEIVE AN EMAIL CONTAINING A 
        TRACKING NUMBER AND LINK TO TRACK YOUR PACKAGE. ALLOW UP TO 2 DAYS FOR 
        YOUR TRACKING NUMBER TO PROCESS AND UPDATE. TO CHECK THE STATUS OF AN 
        ORDER YOU’VE RECENTLY PLACED ONLINE, PLEASE EMAIL: 
        INFO@BAYAREA FIRESTORE.COM FOR HELP.
      </p>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        CERTAIN COUNTRIES FOR INTERNATIONAL ORDERS HAVE TRACKING NUMBERS THAT 
        CAN ONLY BE TRACKED WHILE STILL IN THE U.S. - ONCE ORDER EXITS U.S. GROUNDS, 
        SOME ORDERS WILL NO LONGER BE TRACKED.
      </p>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        UNANSWERED QUESTIONS? PLEASE EMAIL info@bayareafirestore.com
      </p>
      <h2 className="mt-10 text-3xl font-medium">Customer Care</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Bay Area Fire Store is a firefighter owned/operated business. We are dedicated 
        to providing high-quality gear and equipment to our customers. Our customer care team 
        is committed to ensuring that you have a great experience with us. If you have any queries 
        or need assistance, please don't hesitate to contact us. Your satisfaction is our priority.
        We believe in transparency and trust. Therefore, we have a detailed customer 
        care policy to provide you with the confidence to shop with us. We are here 
        to assist you and make your experience with the Bay Area Fire Store exceptional. 
      </p>

      <h2 className="mt-8 text-3xl font-medium">Wholesale Inquiries</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Are you a retailer interested in selling our exceptional products? 
        We welcome wholesale inquiries and are excited to collaborate with other 
        businesses. By partnering with us, you can take your business to the next 
        level. Our stunning products are designed to attract customers and boost 
        your sales. Let's work together to make a difference in the industry.
      </p>

      <h2 className="mt-8 text-3xl font-medium">Payment Methods</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Credit / Debit Cards, Apple Pay
      </p>
    </div>
  );
}