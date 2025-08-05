import BasicDetails from "./basic-details";
import ContactDetails from "./contact-details";
import ItemsList from "./items-list";
import TaxAndTotals from "./tax-and-totals";

export default function InvoiceForm() {
  return (
    <div className="space-y-6 px-4 md:px-6 pb-10 max-w-4xl mx-auto">
      <BasicDetails />
      <ContactDetails />
      <ItemsList />
      <TaxAndTotals />
    </div>
  );
}
