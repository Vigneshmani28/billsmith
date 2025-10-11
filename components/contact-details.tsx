import { useInvoice } from "@/context/invoice-context";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchOwnerInfo } from "@/store/slices/owner/ownerInfoSlice";

export default function ContactDetails() {
  const { invoice, updateInvoice } = useInvoice();
  const [errors, setErrors] = useState({
    from_email: "",
    from_phone: "",
    from_pan: "",
    from_gstin: "",
    to_email: "",
    to_phone: "",
    to_pan: "",
    to_gstin: ""
  });
  const [isOwnerInfoLoaded, setIsOwnerInfoLoaded] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
    const { info, loading, error } = useSelector(
      (state: RootState) => state.ownerInfo
    );

    useEffect(() => {
        dispatch(fetchOwnerInfo());
      }, [dispatch]);

    useEffect(() => {
      if (info && !loading && !isOwnerInfoLoaded) {
        updateInvoice({
          from_name: info.ownerName || "",
          from_email: info.ownerEmail || "",
          from_address: info.ownerAddress || "",
          from_phone: info.ownerPhone || "",
          from_pan: info.ownerPan || "",
          from_gstin: info.gstin || ""
        });
        setIsOwnerInfoLoaded(true);
      }
    }, [info, loading, isOwnerInfoLoaded, updateInvoice]);

  const validateEmail = (email: string) => {
    if (!email) return "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? "" : "Invalid email format";
  };

  const validatePhone = (phone: string) => {
    if (!phone) return "";
    const phoneRegex = /^[+]?[\d\s-()]{10,15}$/;
    return phoneRegex.test(phone) ? "" : "Invalid phone format";
  };

  const validatePAN = (pan: string) => {
    if (!pan) return "";
    const panRegex = /^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/;
    return panRegex.test(pan) ? "" : "Invalid PAN format (e.g., ABCDE1234F)";
  };

  const validateGSTIN = (gstin: string) => {
    if (!gstin) return "";
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin) ? "" : "Invalid GSTIN format";
  };

  const handleFieldChange = (field: string, value: string) => {
    updateInvoice({ [field]: value });
    
    let error = "";
    switch (field) {
      case "from_email":
      case "to_email":
        error = validateEmail(value);
        break;
      case "from_phone":
      case "to_phone":
        error = validatePhone(value);
        break;
      case "from_pan":
      case "to_pan":
        error = validatePAN(value);
        break;
      case "from_gstin":
      case "to_gstin":
        error = validateGSTIN(value);
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Billing Info</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-medium text-base">From (You)</h3>
          <div className="space-y-2">
            <Label htmlFor="fromName">Name <span className="text-red-500">*</span></Label>
            <Input
              id="fromName"
              disabled = {true}
              value={invoice.from_name ?? ""}
              onChange={(e) => updateInvoice({ from_name: e.target.value })}
              placeholder="Your name or company"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fromEmail">Email <span className="text-red-500">*</span></Label>
            <Input
              id="fromEmail"
              disabled = {true}
              value={invoice.from_email ?? ""}
              onChange={(e) => handleFieldChange("from_email", e.target.value)}
              placeholder="your@email.com"
              type="email"
              className={errors.from_email ? "border-red-500" : ""}
            />
            {errors.from_email && (
              <p className="text-sm text-red-500">{errors.from_email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="fromAddress">Address</Label>
            <Input
              id="fromAddress"
              disabled = {true}
              value={invoice.from_address ?? ""}
              onChange={(e) => updateInvoice({ from_address: e.target.value })}
              placeholder="Your address"
              type="text"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fromPhone">Phone <span className="text-red-500">*</span></Label>
            <Input
              id="fromPhone"
              disabled = {true}
              value={invoice.from_phone ?? ""}
              onChange={(e) => handleFieldChange("from_phone", e.target.value)}
              placeholder="Your phone number"
              type="tel"
              className={errors.from_phone ? "border-red-500" : ""}
            />
            {errors.from_phone && (
              <p className="text-sm text-red-500">{errors.from_phone}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="fromPan">PAN <span className="text-red-500">*</span></Label>
            <Input
              id="fromPan"
              disabled = {true}
              value={invoice.from_pan?.toLocaleUpperCase() ?? ""}
              onChange={(e) => handleFieldChange("from_pan", e.target.value)}
              placeholder="Your PAN number"
              type="text"
              className={errors.from_pan ? "border-red-500" : ""}
            />
            {errors.from_pan && (
              <p className="text-sm text-red-500">{errors.from_pan}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="fromGstin">GSTIN <span className="text-red-500">*</span></Label>
            <Input
              id="fromGstin"
              disabled = {true}
              value={invoice.from_gstin ?? ""}
              onChange={(e) => handleFieldChange("from_gstin", e.target.value)}
              placeholder="Your GSTIN number"
              type="text"
              className={errors.from_gstin ? "border-red-500" : ""}
            />
            {errors.from_gstin && (
              <p className="text-sm text-red-500">{errors.from_gstin}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-base">To (Client)</h3>
          <div className="space-y-2">
            <Label htmlFor="toName">Name <span className="text-red-500">*</span></Label>
            <Input
              id="toName"
              value={invoice.to_name ?? ""}
              onChange={(e) => updateInvoice({ to_name: e.target.value })}
              placeholder="Client name or company"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="toEmail">Email <span className="text-red-500">*</span></Label>
            <Input
              id="toEmail"
              value={invoice.to_email ?? ""}
              onChange={(e) => handleFieldChange("to_email", e.target.value)}
              placeholder="client@email.com"
              type="email"
              className={errors.to_email ? "border-red-500" : ""}
            />
            {errors.to_email && (
              <p className="text-sm text-red-500">{errors.to_email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="toAddress">Address</Label>
            <Input
              id="toAddress"
              value={invoice.to_address ?? ""}
              onChange={(e) => updateInvoice({ to_address: e.target.value })}
              placeholder="client address"
              type="text"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="toPhone">Phone <span className="text-red-500">*</span></Label>
            <Input
              id="toPhone"
              value={invoice.to_phone ?? ""}
              onChange={(e) => handleFieldChange("to_phone", e.target.value)}
              placeholder="Client phone number"
              type="tel"
              className={errors.to_phone ? "border-red-500" : ""}
            />
            {errors.to_phone && (
              <p className="text-sm text-red-500">{errors.to_phone}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="toPan">PAN <span className="text-red-500">*</span></Label>
            <Input
              id="toPan"
              value={invoice.to_pan?.toLocaleUpperCase() ?? ""}
              onChange={(e) => handleFieldChange("to_pan", e.target.value)}
              placeholder="Client PAN number"
              type="text"
              className={errors.to_pan ? "border-red-500" : ""}
            />
            {errors.to_pan && (
              <p className="text-sm text-red-500">{errors.to_pan}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="toGstin">GSTIN <span className="text-red-500">*</span></Label>
            <Input
              id="toGstin"
              value={invoice.to_gstin ?? ""}
              onChange={(e) => handleFieldChange("to_gstin", e.target.value)}
              placeholder="Client GSTIN number"
              type="text"
              className={errors.to_gstin ? "border-red-500" : ""}
            />
            {errors.to_gstin && (
              <p className="text-sm text-red-500">{errors.to_gstin}</p>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
            💡 Go to{" "}
            <kbd className="px-2 py-1 text-xs bg-gray-100 border rounded">
              Settings
            </kbd>{" "}
            to edit your "From" details
          </p>
      </CardContent>
    </Card>
  );
}
