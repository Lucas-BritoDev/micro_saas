import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToXLS = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${filename}.xlsx`);
  } catch (error) {
    console.error('Error exporting to XLS:', error);
    throw new Error('Erro ao exportar arquivo Excel');
  }
};

export const exportDashboardData = (metrics: {
  imcScore: string,
  imcAverage: string,
  activeMTRs: string,
  expiredMTRs: string,
  esgScore: string,
  esgAverage: string,
  monthlyRevenue: string,
  monthlyExpense: string,
  monthlyBalance: string
}) => {
  const data = [
    { Métrica: 'Score IMC', Valor: metrics.imcScore },
    { Métrica: 'Média IMC', Valor: metrics.imcAverage },
    { Métrica: 'Score ESG', Valor: metrics.esgScore },
    { Métrica: 'Média ESG', Valor: metrics.esgAverage },
    { Métrica: 'MTRs Ativos', Valor: metrics.activeMTRs },
    { Métrica: 'MTRs Vencidos', Valor: metrics.expiredMTRs },
    { Métrica: 'Receita Mensal', Valor: metrics.monthlyRevenue },
    { Métrica: 'Despesa Mensal', Valor: metrics.monthlyExpense },
    { Métrica: 'Saldo Mensal', Valor: metrics.monthlyBalance },
  ];
  exportToXLS(data, 'dashboard-report', 'Dashboard');
};

export const exportIMCResults = async (assessment: any) => {
  // Seleciona o elemento do resultado na tela
  const resultElement = document.querySelector('.imc-result-section');
  if (resultElement) {
    // Captura a tela como imagem
    const canvas = await html2canvas(resultElement as HTMLElement);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pageWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight);
    pdf.save('relatorio-imc.pdf');
    return;
  }
  // Fallback: exporta como XLS se não encontrar o elemento
  const data = [
    { Categoria: 'Pontuação Total IMC', Valor: `${assessment.total_score || assessment.score || 0}/100` },
    { Categoria: 'Score Governança', Valor: `${assessment.category_scores?.governance ?? assessment.governance_score ?? 0}/100` },
    { Categoria: 'Score Design', Valor: `${assessment.category_scores?.design ?? assessment.design_score ?? 0}/100` },
    { Categoria: 'Score Materiais', Valor: `${assessment.category_scores?.materials ?? assessment.materials_score ?? 0}/100` },
    { Categoria: 'Score Resíduos', Valor: `${assessment.category_scores?.waste ?? assessment.waste_score ?? 0}/100` },
    { Categoria: 'Score Energia', Valor: `${assessment.category_scores?.energy ?? assessment.energy_score ?? 0}/100` },
    { Categoria: 'Score Água', Valor: `${assessment.category_scores?.water ?? assessment.water_score ?? 0}/100` },
  ];
  exportToXLS(data, 'imc-assessment-results', 'Avaliação IMC');
};

export const exportMTRData = (mtrs: any[]) => {
  const data = mtrs.map(mtr => ({
    'Número MTR': mtr.mtr_number,
    'Projeto': mtr.project_name,
    'Tipo de Resíduo': mtr.waste_type,
    'Quantidade': mtr.quantity,
    'Unidade': mtr.unit,
    'Status': mtr.status,
    'Data de Emissão': new Date(mtr.issue_date).toLocaleDateString('pt-BR'),
    'Data de Vencimento': new Date(mtr.due_date).toLocaleDateString('pt-BR'),
    'Localização': mtr.location
  }));
  
  exportToXLS(data, 'mtrs-report', 'MTRs');
};

export const exportESGData = (goals: any[], metrics: any[]) => {
  const data = [
    ...goals.map(goal => ({
      Tipo: 'Meta',
      Categoria: goal.category,
      Título: goal.title,
      'Valor Atual': goal.current_value,
      'Valor Meta': goal.target_value,
      'Data Meta': new Date(goal.target_date).toLocaleDateString('pt-BR')
    })),
    ...metrics.map((metric, index) => ({
      Tipo: 'Métrica',
      Categoria: ['Environmental', 'Social', 'Governance'][index % 3],
      Título: `Métrica ${index + 1}`,
      'Valor Atual': metric.value,
      'Valor Meta': '-',
      'Data Meta': '-'
    }))
  ];
  
  exportToXLS(data, 'esg-report', 'ESG');
};

export const exportFinancialData = (transactions: any[]) => {
  const data = transactions.map(transaction => ({
    'Descrição': transaction.description,
    'Projeto': transaction.project,
    'Valor': transaction.amount,
    'Tipo': transaction.type === 'income' ? 'Receita' : 'Despesa',
    'Data': new Date(transaction.date).toLocaleDateString('pt-BR'),
    'Categoria': transaction.category || 'Não categorizado'
  }));
  
  exportToXLS(data, 'financial-transactions', 'Transações');
};

export function exportMTRSinirReport(mtr) {
  // Gera um PDF com os campos do formulário preenchidos
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let y = 15;
  doc.setFontSize(16);
  doc.text('Relatório SINIR - Manifesto de Transporte de Resíduos', 15, y);
  y += 10;
  doc.setFontSize(12);
  doc.text('Número MTR: ' + (mtr.mtr_number || ''), 15, y);
  doc.text('Projeto/Obra: ' + (mtr.project_name || ''), 110, y);
  y += 8;
  doc.text('Localização: ' + (mtr.location || ''), 15, y);
  y += 10;
  doc.setFont(undefined, 'bold');
  doc.text('Informações do Resíduo', 15, y);
  doc.setFont(undefined, 'normal');
  y += 8;
  doc.text('Tipo de Resíduo: ' + (mtr.waste_type || ''), 15, y);
  doc.text('Quantidade: ' + (mtr.quantity || ''), 80, y);
  doc.text('Unidade: ' + (mtr.unit || ''), 140, y);
  y += 8;
  doc.text('Descrição: ' + (mtr.description || ''), 15, y);
  y += 10;
  doc.setFont(undefined, 'bold');
  doc.text('Gerador', 15, y);
  doc.setFont(undefined, 'normal');
  y += 8;
  doc.text('Nome/Razão Social: ' + (mtr.generator_name || ''), 15, y);
  doc.text('CNPJ: ' + (mtr.generator_cnpj || ''), 110, y);
  y += 8;
  doc.text('Endereço: ' + (mtr.generator_address || ''), 15, y);
  y += 10;
  doc.setFont(undefined, 'bold');
  doc.text('Transportador', 15, y);
  doc.setFont(undefined, 'normal');
  y += 8;
  doc.text('Nome/Razão Social: ' + (mtr.transporter_name || ''), 15, y);
  doc.text('CNPJ: ' + (mtr.transporter_cnpj || ''), 80, y);
  doc.text('Licença: ' + (mtr.transporter_license || ''), 140, y);
  y += 10;
  doc.setFont(undefined, 'bold');
  doc.text('Receptor', 15, y);
  doc.setFont(undefined, 'normal');
  y += 8;
  doc.text('Nome/Razão Social: ' + (mtr.receiver_name || ''), 15, y);
  doc.text('CNPJ: ' + (mtr.receiver_cnpj || ''), 80, y);
  doc.text('Licença: ' + (mtr.receiver_license || ''), 140, y);
  y += 10;
  doc.setFont(undefined, 'bold');
  doc.text('Datas', 15, y);
  doc.setFont(undefined, 'normal');
  y += 8;
  doc.text('Data de Emissão: ' + (mtr.issue_date ? new Date(mtr.issue_date).toLocaleDateString('pt-BR') : ''), 15, y);
  doc.text('Data de Vencimento: ' + (mtr.due_date ? new Date(mtr.due_date).toLocaleDateString('pt-BR') : ''), 80, y);
  y += 15;
  doc.save(`relatorio_sinir_${mtr.mtr_number || 'mtr'}.pdf`);
}
