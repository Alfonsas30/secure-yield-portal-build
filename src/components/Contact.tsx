
import ContactHeader from "./contact/ContactHeader";
import ContactForm from "./contact/ContactForm";
import NewsletterSubscription from "./contact/NewsletterSubscription";

const Contact = () => {

  return (
    <section id="kontaktai" className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <ContactHeader />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ContactForm />
          <NewsletterSubscription />
        </div>
      </div>
    </section>
  );
};

export default Contact;
