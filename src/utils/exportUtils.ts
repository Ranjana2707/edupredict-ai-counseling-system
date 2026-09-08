import { toast } from 'sonner';

export const exportToCSV = (data: any[], fileName: string) => {
  if (!data || data.length === 0) {
    toast.error('No data available to export.');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(fieldName => {
        const value = row[fieldName];
        // Handle strings with commas
        const stringVal = value !== undefined && value !== null ? String(value) : '';
        return stringVal.includes(',') ? `"${stringVal}"` : stringVal;
      }).join(',')
    )
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast.success(`Exported CSV: ${fileName}.csv`);
};

export const exportToExcel = (data: any[], sheetName: string) => {
  if (!data || data.length === 0) {
    toast.error('No data available to export.');
    return;
  }

  // Create simple Excel-friendly XML schema for native Excel support
  const headers = Object.keys(data[0]);
  let xml = '<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">';
  xml += `<Worksheet ss:Name="${sheetName}"><Table>`;
  
  // Header row
  xml += '<Row>';
  headers.forEach(h => {
    xml += `<Cell><Data ss:Type="String">${h}</Data></Cell>`;
  });
  xml += '</Row>';

  // Data rows
  data.forEach(row => {
    xml += '<Row>';
    headers.forEach(h => {
      const val = row[h];
      const type = typeof val === 'number' ? 'Number' : 'String';
      xml += `<Cell><Data ss:Type="${type}">${val}</Data></Cell>`;
    });
    xml += '</Row>';
  });

  xml += '</Table></Worksheet></Workbook>';

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${sheetName}_${new Date().toISOString().split('T')[0]}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast.success(`Exported Excel: ${sheetName}.xls`);
};

export const triggerPrint = (elementId: string) => {
  const printContents = document.getElementById(elementId)?.innerHTML;
  if (!printContents) {
    toast.error('Could not locate printable dashboard region.');
    return;
  }

  // Use a neat iframe print pattern to avoid messing up active SPA layout states
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (doc) {
    doc.write(`
      <html>
        <head>
          <title>System BI Analytics Report</title>
          <style>
            body {
              font-family: 'Inter', sans-serif;
              color: #111827;
              padding: 24px;
              background: #fff;
            }
            .grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 16px; }
            .col-4 { grid-column: span 4; }
            .col-6 { grid-column: span 6; }
            .col-12 { grid-column: span 12; }
            .card {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 16px;
              margin-bottom: 16px;
              box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            }
            .title { font-size: 14px; font-weight: bold; color: #4b5563; text-transform: uppercase; margin-bottom: 8px; }
            .value { font-size: 28px; font-weight: 900; color: #111827; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
            th, td { border-bottom: 1px solid #e5e7eb; padding: 10px; text-align: left; }
            th { background: #f9fafb; font-weight: bold; color: #374151; }
            h2 { border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-top: 24px; font-size: 18px; }
            .flex { display: flex; justify-content: space-between; align-items: center; }
            .logo { font-weight: 900; color: #2563eb; font-size: 16px; }
            .date { font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="flex" style="border-bottom: 2px solid #3b82f6; padding-bottom: 12px; margin-bottom: 24px;">
            <div class="logo">EduPredict AI - BI Analytics Engine</div>
            <div class="date">Report Compiled: ${new Date().toLocaleString()}</div>
          </div>
          ${printContents}
        </body>
      </html>
    `);
    doc.close();

    // Give browser brief time to compile stylesheet assets
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 500);
    }, 500);
  }
};
