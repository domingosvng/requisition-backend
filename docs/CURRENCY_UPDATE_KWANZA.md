# Currency Update: Euro to Kwanza (Angola)

## 🎯 Overview
Updated the application currency from Euro (€) to Kwanza (Kz) for use in Angola.

## ✅ Changes Made

### 1. **Inventario Component Updates**
- ✅ **Form Label**: Changed "Valor Unitário (€)" to "Valor Unitário (Kz)"
- ✅ **Table Header**: Updated "Valor Unit." to "Valor Unit. (Kz)"
- ✅ **Currency Display**: Added proper Kwanza formatting with locale support
- ✅ **New Formatting Method**: Added `formatCurrency()` method for consistent display

### 2. **Currency Formatting Features**
- ✅ **Proper Locale**: Uses 'pt-AO' (Portuguese - Angola) locale
- ✅ **Decimal Places**: Shows 2 decimal places (e.g., "1.234,56 Kz")
- ✅ **Thousand Separators**: Proper formatting for large amounts
- ✅ **Null Handling**: Shows '-' for empty/null values

## 🔧 Technical Implementation

### Currency Formatting Method
```javascript
formatCurrency(value) {
    if (value == null || value === '') return '-';
    const numValue = Number(value);
    if (isNaN(numValue)) return '-';
    return numValue.toLocaleString('pt-AO', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    }) + ' Kz';
}
```

### Display Examples
- **Empty Value**: Shows "-"
- **Zero**: Shows "0,00 Kz"
- **Decimal**: Shows "1.234,56 Kz"
- **Large Number**: Shows "10.000,00 Kz"

## 🌍 Angola Localization
- **Currency Symbol**: Kz (Kwanza)
- **Locale**: pt-AO (Portuguese - Angola)
- **Number Format**: Uses Angolan number formatting conventions
- **Decimal Separator**: Comma (,)
- **Thousand Separator**: Period (.)

## 📋 Updated Components

### Inventario Component
- ✅ Form input label now shows "(Kz)"
- ✅ Table header shows "Valor Unit. (Kz)"
- ✅ All value displays use proper Kwanza formatting
- ✅ Consistent currency handling throughout

## 🚀 Benefits
1. **Proper Localization**: Uses Angola's official currency
2. **Professional Formatting**: Numbers displayed according to local conventions
3. **Consistent Display**: Same formatting across all components
4. **User-Friendly**: Clear currency indication in all relevant fields
5. **Scalable**: Easy to add more currency formatting if needed for other regions

## 🔍 Verification
To verify the changes:
1. Navigate to Inventário section
2. Add or edit an item
3. Enter a value in "Valor Unitário (Kz)" field
4. Check that the table displays values as "X,XX Kz" format
5. Verify proper Angolan number formatting (comma for decimals, period for thousands)

The application now properly supports Kwanza as the primary currency with appropriate formatting for the Angolan market.