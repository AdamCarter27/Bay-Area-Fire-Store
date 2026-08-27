import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers on shipping times, order tracking, and custom orders at the Bay Area Fire Store.",
};

const faqs = [
  {
    q: "Q: Why haven't I received any shipping info on my order?",
    a: "A: At Bay Area Fire Store, we strive to provide efficient and reliable shipping for all of our customers. However, there may be several reasons why you haven't received shipping information on your order. Firstly, please ensure that the email address provided at the time of purchase is accurate and check your spam or junk folder for any communication from us. Additionally, some orders may take 1-7 business days to process before shipping, especially during peak times. If your order contains personalized or custom items, it may require additional processing time. If you still haven't received any shipping information after the processing time has elapsed, please reach out to our customer service team with your order details, and we will be more than happy to assist you further. We apologize for any inconvenience and thank you for your patience as we work to get your order to you as quickly as possible."
  },
  {
    q: "Have a customized order you don't see online?",
    a: "Please feel free to reach out about a custom order you'd like to make. A customer service team member will reach out to you about your order. ",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold">FAQ</h1>
      <div className="mt-8 flex flex-col gap-6">
        {faqs.map((item) => (
          <div key={item.q}>
            <h3 className="font-medium">{item.q}</h3>
            <p className="mt-3 text-white-600 dark:text-white-400">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
