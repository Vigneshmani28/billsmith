"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchOwnerInfo,
  updateOwnerInfo,
} from "@/store/slices/owner/ownerInfoSlice";
import { BankAccount, OwnerInfo } from "@/types/invoice";
import { ContentLoader } from "@/components/loader";
import { Settings2, Upload, User } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useCurrency } from "@/context/currency-context"; // adjust import path as needed

const SIDEBAR_ITEMS = [
  { key: "owner", label: "Owner Info", icon: <User height={20} /> },
  { key: "preferences", label: "Preferences", icon: <Settings2 height={20} /> },
  // Future: add more settings sections here
];

export default function SettingsPage() {
  const { token } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const { info, loading, error } = useSelector(
    (state: RootState) => state.ownerInfo
  );

  const { currency, setCurrency, locale, setLocale } = useCurrency();

  const [formData, setFormData] = useState({
    ownerName: "",
    gstin: "",
    ownerEmail: "",
    ownerPhone: "",
    ownerPan: "",
    ownerAddress: "",
    bankAccount: {
      accountNumber: "",
      holderName: "",
      ifsc: "",
      branch: "",
    },
  });

  const [activeSection, setActiveSection] = useState("owner");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    dispatch(fetchOwnerInfo());
  }, [dispatch]);

  useEffect(() => {
    if (info) {
      setFormData({
        ownerName: info.ownerName || "",
        gstin: info.gstin || "",
        ownerEmail: info.ownerEmail || "",
        ownerPhone: info.ownerPhone || "",
        ownerPan: info.ownerPan || "",
        ownerAddress: info.ownerAddress || "",
        bankAccount: {
          accountNumber: info.bankAccount?.accountNumber || "",
          holderName: info.bankAccount?.holderName || "",
          ifsc: info.bankAccount?.ifsc || "",
          branch: info.bankAccount?.branch || "",
        },
      });
    }
  }, [info]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (["accountNumber", "holderName", "ifsc", "branch"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        bankAccount: {
          ...prev.bankAccount,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Helper to get changed fields only
  const getChangedFields = (): Partial<OwnerInfo> => {
    if (!info) return {};
    const changed: Partial<OwnerInfo> = {};

    // Top-level keys typed correctly
    const topLevelKeys: (keyof Omit<OwnerInfo, "bankAccount">)[] = [
      "ownerName",
      "gstin",
      "ownerEmail",
      "ownerPhone",
      "ownerPan",
      "ownerAddress",
    ];

    topLevelKeys.forEach((key) => {
      if (formData[key] !== info[key]) {
        changed[key] = formData[key];
      }
    });

    // ✅ Bank account comparison
    if (formData.bankAccount && info.bankAccount) {
      const bankChanged: Partial<BankAccount> = {};
      (
        [
          "accountNumber",
          "holderName",
          "ifsc",
          "branch",
        ] as (keyof BankAccount)[]
      ).forEach((key) => {
        if (formData.bankAccount[key] !== info.bankAccount[key]) {
          bankChanged[key] = formData.bankAccount[key];
        }
      });

      if (Object.keys(bankChanged).length > 0) {
        changed.bankAccount = bankChanged as BankAccount;
      }
    } else if (formData.bankAccount) {
      // If no bankAccount info exists, send all
      changed.bankAccount = { ...formData.bankAccount };
    }

    return changed;
  };

  const handleEditClick = () => setEditMode(true);
  const handleCancelEdit = () => {
    setEditMode(false);
    if (info) {
      setFormData({
        ownerName: info.ownerName || "",
        gstin: info.gstin || "",
        ownerEmail: info.ownerEmail || "",
        ownerPhone: info.ownerPhone || "",
        ownerPan: info.ownerPan || "",
        ownerAddress: info.ownerAddress || "",
        bankAccount: {
          accountNumber: info.bankAccount?.accountNumber || "",
          holderName: info.bankAccount?.holderName || "",
          ifsc: info.bankAccount?.ifsc || "",
          branch: info.bankAccount?.branch || "",
        },
      });
    }
  };

  const handleSubmit = async () => {
    try {
      let payload = getChangedFields();

      if (payload.bankAccount) {
        payload = { ...payload, ...payload.bankAccount };
        delete payload.bankAccount;
      }

      if (Object.keys(payload).length === 0) {
        toast.info("No changes to update.");
        return;
      }

      await dispatch(updateOwnerInfo(payload)).unwrap();

      toast.success("Owner info updated successfully!");
      dispatch(fetchOwnerInfo());
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to update owner info"
      );
    }
    setEditMode(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/70 z-50">
        <ContentLoader message="Loading invoices..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Owner Settings</h1>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh]">
      {/* Sidebar */}
      <aside className="w-64 border-r px-6 py-8 flex flex-col gap-4">
        <h2 className="text-lg font-semibold mb-4">Settings</h2>
        <nav className="flex flex-col gap-2">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors cursor-pointer ${
                activeSection === item.key
                  ? "bg-primary text-primary-foreground font-medium"
                  : "hover:bg-muted"
              }`}
              onClick={() => setActiveSection(item.key)}
            >
              <div className="flex items-center gap-2">
                {item.icon && (
                  <span className="flex-shrink-0 flex items-center justify-center text-base">
                    {item.icon}
                  </span>
                )}
                <span className="text-sm">{item.label}</span>
              </div>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="px-8">
        {activeSection === "owner" && (
          <section className="w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Owner Info</h1>
            {!editMode ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-2 text-muted-foreground text-xs">
                    Owner Name
                  </div>
                  <div className="font-medium">{info?.ownerName || "-"}</div>
                </div>
                <div>
                  <div className="mb-2 text-muted-foreground text-xs">
                    GSTIN
                  </div>
                  <div className="font-medium">{info?.gstin || "-"}</div>
                </div>
                <div>
                  <div className="mb-2 text-muted-foreground text-xs">
                    Owner Email
                  </div>
                  <div className="font-medium">{info?.ownerEmail || "-"}</div>
                </div>
                <div>
                  <div className="mb-2 text-muted-foreground text-xs">
                    Owner Phone
                  </div>
                  <div className="font-medium">{info?.ownerPhone || "-"}</div>
                </div>
                <div>
                  <div className="mb-2 text-muted-foreground text-xs">
                    Owner PAN
                  </div>
                  <div className="font-medium">{info?.ownerPan || "-"}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="mb-2 text-muted-foreground text-xs">
                    Owner Address
                  </div>
                  <div className="font-medium">{info?.ownerAddress || "-"}</div>
                </div>
                <div className="md:col-span-2 border-t pt-4 mt-2">
                  <div className="mb-2 text-muted-foreground text-xs">
                    Bank Account
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Account Number
                      </div>
                      <div className="font-medium">
                        {info?.bankAccount?.accountNumber || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Holder Name
                      </div>
                      <div className="font-medium">
                        {info?.bankAccount?.holderName || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">IFSC</div>
                      <div className="font-medium">
                        {info?.bankAccount?.ifsc || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Branch
                      </div>
                      <div className="font-medium">
                        {info?.bankAccount?.branch || "-"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <Input
                  name="ownerName"
                  placeholder="Owner Name"
                  value={formData.ownerName}
                  onChange={handleChange}
                />
                <Input
                  name="gstin"
                  placeholder="GSTIN"
                  value={formData.gstin}
                  onChange={handleChange}
                />
                <Input
                  name="ownerEmail"
                  placeholder="Owner Email"
                  value={formData.ownerEmail}
                  onChange={handleChange}
                />
                <Input
                  name="ownerPhone"
                  placeholder="Owner Phone"
                  value={formData.ownerPhone}
                  onChange={handleChange}
                />
                <Input
                  name="ownerPan"
                  placeholder="Owner PAN"
                  value={formData.ownerPan}
                  onChange={handleChange}
                />
                <Textarea
                  name="ownerAddress"
                  placeholder="Owner Address"
                  value={formData.ownerAddress}
                  onChange={handleChange}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    name="accountNumber"
                    placeholder="Account Number"
                    value={formData.bankAccount.accountNumber}
                    onChange={handleChange}
                  />
                  <Input
                    name="holderName"
                    placeholder="Account Holder Name"
                    value={formData.bankAccount.holderName}
                    onChange={handleChange}
                  />
                  <Input
                    name="ifsc"
                    placeholder="IFSC Code"
                    value={formData.bankAccount.ifsc}
                    onChange={handleChange}
                  />
                  <Input
                    name="branch"
                    placeholder="Branch"
                    value={formData.bankAccount.branch}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} type="submit">
                    Save
                  </Button>
                </div>
              </form>
            )}
            {!editMode && (
              <div className="flex justify-end mt-6">
                <Button variant="outline" onClick={handleEditClick}>
                  Edit
                </Button>
              </div>
            )}
          </section>
        )}

        {activeSection === "preferences" && (
          <section className="max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Preferences</h1>
            <div className="flex flex-col gap-6">
              <div>
                <Label htmlFor="currency" className="mb-2 block">
                  Currency
                </Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency" className="w-full">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="locale" className="mb-2 block">
                  Locale
                </Label>
                <Select value={locale} onValueChange={setLocale}>
                  <SelectTrigger id="locale" className="w-full">
                    <SelectValue placeholder="Select locale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-IN">en-IN</SelectItem>
                    <SelectItem value="en-US">en-US</SelectItem>
                    <SelectItem value="de-DE">de-DE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
