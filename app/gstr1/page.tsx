"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, DownloadIcon, RefreshCwIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { fetchInvoices } from '@/store/slices/invoice/invoiceSlice'
import { AppDispatch, RootState } from '@/store/store'
import { InvoiceData } from '@/types/invoice'

interface Invoice {
  id: string
  invoice_number: string
  date: string
  from_gstin: string
  to_gstin: string
  is_inter_state: boolean
  subtotal: number
  tax_amount: number
  total: number
  tax_rate: number
  items: Array<{
    description: string
    quantity: number
    rate: number
    amount: number
  }>
}

interface GSTR1Summary {
  b2b: {
    invoices: number
    taxable_value: number
    igst: number
    cgst: number
    sgst: number
    total_tax: number
  }
  b2c: {
    invoices: number
    taxable_value: number
    igst: number
    cgst: number
    sgst: number
    total_tax: number
  }
  hsn_summary: Array<{
    hsn_code: string
    description: string
    uqc: string
    total_quantity: number
    total_value: number
    taxable_value: number
    igst: number
    cgst: number
    sgst: number
    total_tax: number
  }>
}

const GSTR1 = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { items, loading } = useSelector((state: RootState) => state.invoices)
  
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly'>('monthly')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedQuarter, setSelectedQuarter] = useState<string>('Q1-2025')

  // Derive selectedMonth from selectedDate
  const selectedMonth = useMemo(() => {
    return format(selectedDate, 'yyyy-MM')
  }, [selectedDate])

  useEffect(() => {
    dispatch(fetchInvoices())
  }, [dispatch])

  const filteredInvoices = useMemo(() => {
    if (!items?.length) return []
    
    return items.filter((invoice: InvoiceData) => {
      const invoiceDate = new Date(invoice.date)
      
      if (selectedPeriod === 'monthly') {
        return invoiceDate.getFullYear() === selectedDate.getFullYear() && 
               invoiceDate.getMonth() === selectedDate.getMonth()
      } else {
        const [quarter, year] = selectedQuarter.split('-')
        const targetYear = parseInt(year)
        const quarterMonths = {
          'Q1': [0, 1, 2], // Jan, Feb, Mar
          'Q2': [3, 4, 5], // Apr, May, Jun
          'Q3': [6, 7, 8], // Jul, Aug, Sep
          'Q4': [9, 10, 11] // Oct, Nov, Dec
        }
        
        return invoiceDate.getFullYear() === targetYear && 
               quarterMonths[quarter as keyof typeof quarterMonths]?.includes(invoiceDate.getMonth())
      }
    })
  }, [items, selectedPeriod, selectedDate, selectedQuarter])

  const gstr1Summary: GSTR1Summary = useMemo(() => {
    const summary: GSTR1Summary = {
      b2b: { invoices: 0, taxable_value: 0, igst: 0, cgst: 0, sgst: 0, total_tax: 0 },
      b2c: { invoices: 0, taxable_value: 0, igst: 0, cgst: 0, sgst: 0, total_tax: 0 },
      hsn_summary: []
    }

    filteredInvoices.forEach((invoice: InvoiceData) => {
      const isB2B = invoice.to_gstin && invoice.to_gstin.length === 15
      const taxableValue = invoice.subtotal
      const taxAmount = invoice.tax_amount
      
      if (isB2B) {
        summary.b2b.invoices++
        summary.b2b.taxable_value += taxableValue ?? 0
        summary.b2b.total_tax += taxAmount ?? 0
        
        if (invoice.is_inter_state) {
          summary.b2b.igst += taxAmount ?? 0
        } else {
          summary.b2b.cgst += (taxAmount ?? 0) / 2
          summary.b2b.sgst += (taxAmount ?? 0) / 2
        }
      } else {
        summary.b2c.invoices++
        summary.b2c.taxable_value += taxableValue ?? 0
        summary.b2c.total_tax += taxAmount ?? 0

        if (invoice.is_inter_state) {
          summary.b2c.igst += taxAmount ?? 0
        } else {
          summary.b2c.cgst += (taxAmount ?? 0) / 2
          summary.b2c.sgst += (taxAmount ?? 0) / 2
        }
      }
    })

    return summary
  }, [filteredInvoices])

  const generateQuarters = () => {
    const quarters = []
    const currentYear = new Date().getFullYear()
    for (let year = currentYear - 2; year <= currentYear + 1; year++) {
      quarters.push(`Q1-${year}`, `Q2-${year}`, `Q3-${year}`, `Q4-${year}`)
    }
    return quarters
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const downloadReport = () => {
    const reportData = {
      period: selectedPeriod === 'monthly' ? selectedMonth : selectedQuarter,
      summary: gstr1Summary,
      invoices: filteredInvoices
    }
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `GSTR1-${selectedPeriod === 'monthly' ? selectedMonth : selectedQuarter}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const MonthYearPicker = () => {
    const [currentDate, setCurrentDate] = useState(selectedDate)
    
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()

    const handleMonthChange = (monthIndex: number) => {
      const newDate = new Date(currentYear, monthIndex, 1)
      setCurrentDate(newDate)
      setSelectedDate(newDate)
    }

    const handleYearChange = (increment: number) => {
      const newDate = new Date(currentYear + increment, currentMonth, 1)
      setCurrentDate(newDate)
      setSelectedDate(newDate)
    }

    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleYearChange(-1)}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <div className="font-semibold text-lg">{currentYear}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleYearChange(1)}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {months.map((month, index) => (
            <Button
              key={month}
              variant={index === currentMonth ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => handleMonthChange(index)}
            >
              {month.slice(0, 3)}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">GSTR-1 Report</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Generate monthly and quarterly GST return summaries</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => dispatch(fetchInvoices())}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <RefreshCwIcon className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={downloadReport} className="w-full sm:w-auto">
            <DownloadIcon className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            Period Selection
          </CardTitle>
          <CardDescription className="text-sm">Select the reporting period for GSTR-1 generation</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
          <Select value={selectedPeriod} onValueChange={(value: 'monthly' | 'quarterly') => setSelectedPeriod(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>

          {selectedPeriod === 'monthly' ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-[180px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "MMMM yyyy") : <span>Pick a month</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <MonthYearPicker />
              </PopoverContent>
            </Popover>
          ) : (
            <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {generateQuarters().map(quarter => (
                  <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Badge variant="secondary" className="w-full sm:w-auto justify-center sm:justify-start">
            {filteredInvoices.length} invoices found
          </Badge>
        </CardContent>
      </Card>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger  className='cursor-pointer' value="summary">Summary</TabsTrigger>
          <TabsTrigger className='cursor-pointer' value="b2b">B2B Sales</TabsTrigger>
          <TabsTrigger className='cursor-pointer' value="b2c">B2C Sales</TabsTrigger>
          <TabsTrigger className='cursor-pointer' value="invoices">Invoice Details</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>B2B Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Invoices:</span>
                  <span className="font-medium">{gstr1Summary.b2b.invoices}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxable Value:</span>
                  <span className="font-medium">{formatCurrency(gstr1Summary.b2b.taxable_value)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IGST:</span>
                  <span className="font-medium">{formatCurrency(gstr1Summary.b2b.igst)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CGST:</span>
                  <span className="font-medium">{formatCurrency(gstr1Summary.b2b.cgst)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST:</span>
                  <span className="font-medium">{formatCurrency(gstr1Summary.b2b.sgst)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Total Tax:</span>
                  <span className="font-semibold">{formatCurrency(gstr1Summary.b2b.total_tax)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>B2C Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Invoices:</span>
                  <span className="font-medium">{gstr1Summary.b2c.invoices}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxable Value:</span>
                  <span className="font-medium">{formatCurrency(gstr1Summary.b2c.taxable_value)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IGST:</span>
                  <span className="font-medium">{formatCurrency(gstr1Summary.b2c.igst)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CGST:</span>
                  <span className="font-medium">{formatCurrency(gstr1Summary.b2c.cgst)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST:</span>
                  <span className="font-medium">{formatCurrency(gstr1Summary.b2c.sgst)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Total Tax:</span>
                  <span className="font-semibold">{formatCurrency(gstr1Summary.b2c.total_tax)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="b2b">
          <Card>
            <CardHeader>
              <CardTitle>B2B Sales Details</CardTitle>
              <CardDescription>Business to Business transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer GSTIN</TableHead>
                    <TableHead>Taxable Value</TableHead>
                    <TableHead>Tax Amount</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices
                    .filter((inv: InvoiceData) => inv.to_gstin && inv.to_gstin.length === 15)
                    .map((invoice: InvoiceData) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                        <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                        <TableCell>{invoice.to_gstin}</TableCell>
                        <TableCell>{formatCurrency(invoice.subtotal ?? 0)}</TableCell>
                        <TableCell>{formatCurrency(invoice.tax_amount ?? 0)}</TableCell>
                        <TableCell>
                          <Badge variant={invoice.is_inter_state ? "default" : "secondary"}>
                            {invoice.is_inter_state ? "Inter-state" : "Intra-state"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="b2c">
          <Card>
            <CardHeader>
              <CardTitle>B2C Sales Details</CardTitle>
              <CardDescription>Business to Consumer transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Taxable Value</TableHead>
                    <TableHead>Tax Amount</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices
                    .filter((inv: InvoiceData) => !inv.to_gstin || inv.to_gstin.length !== 15)
                    .map((invoice: InvoiceData) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                        <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                        <TableCell>{formatCurrency(invoice.subtotal ?? 0)}</TableCell>
                        <TableCell>{formatCurrency(invoice.tax_amount ?? 0)}</TableCell>
                        <TableCell>
                          <Badge variant={invoice.is_inter_state ? "default" : "secondary"}>
                            {invoice.is_inter_state ? "Inter-state" : "Intra-state"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>All Invoice Details</CardTitle>
              <CardDescription>Complete list of filtered invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Taxable Value</TableHead>
                    <TableHead>Tax Rate</TableHead>
                    <TableHead>Tax Amount</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice: InvoiceData) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                      <TableCell>{invoice.to_gstin || 'Consumer'}</TableCell>
                      <TableCell>{formatCurrency(invoice.subtotal ?? 0)}</TableCell>
                      <TableCell>{invoice.tax_rate}%</TableCell>
                      <TableCell>{formatCurrency(invoice.tax_amount ?? 0)}</TableCell>
                      <TableCell>{formatCurrency(invoice.total ?? 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default GSTR1