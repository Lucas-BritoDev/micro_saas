import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Download, Calendar, Lightbulb } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface IMCResultsProps {
  score: number;
  categoryScores: {
    environmental: number;
    social: number;
    governance: number;
    design: number;
    materials: number;
    waste: number;
    energy: number;
    water: number;
  };
  onDownloadReport: () => void;
  onScheduleConsultation: () => void;
  radarColors?: Record<string, string>;
}

export const IMCResults: React.FC<IMCResultsProps> = ({
  score,
  categoryScores,
  onDownloadReport,
  onScheduleConsultation,
  radarColors
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    if (score >= 40) return 'Regular';
    return 'Precisa Melhorar';
  };

  // Radar chart data and color mapping
  const radarData = [
    { categoria: 'Governança', valor: categoryScores.governance },
    { categoria: 'Design', valor: categoryScores.design },
    { categoria: 'Materiais', valor: categoryScores.materials },
    { categoria: 'Resíduos', valor: categoryScores.waste },
    { categoria: 'Energia', valor: categoryScores.energy },
    { categoria: 'Água', valor: categoryScores.water },
  ];

  // Cores para legendas e badges
  const colorMap: Record<string, string> = {
    'Governança': 'text-green-600',
    'Design': 'text-blue-600',
    'Materiais': 'text-yellow-600',
    'Resíduos': 'text-orange-600',
    'Energia': 'text-purple-600',
    'Água': 'text-cyan-600',
  };

  const recommendations = [
    'Implementar sistema de gestão de resíduos mais eficiente',
    'Investir em energia renovável para reduzir pegada de carbono',
    'Desenvolver programas de treinamento em sustentabilidade',
    'Estabelecer parcerias com fornecedores sustentáveis',
    'Criar políticas de governança mais transparentes'
  ];

  return (
    <div className="space-y-6">
      {/* Score Principal */}
      <Card className="text-center">
        <CardHeader>
          <CardTitle>Resultado da Avaliação IMC</CardTitle>
          <CardDescription>Índice de Maturidade Circular</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`text-6xl font-bold mb-4 ${getScoreColor(score)}`}>
            {score}/100
          </div>
          <Badge 
            variant={score >= 80 ? 'default' : score >= 60 ? 'secondary' : 'destructive'}
            className="text-lg px-4 py-2"
          >
            {getScoreLabel(score)}
          </Badge>
        </CardContent>
      </Card>

      {/* Radar de Maturidade */}
      <Card>
        <CardHeader>
          <CardTitle>Radar de Maturidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <RadarChart data={radarData} outerRadius={120}>
                <PolarGrid />
                <PolarAngleAxis dataKey="categoria" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Pontuação"
                  dataKey="valor"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.35}
                  dot={true}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Scores por Categoria */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-green-600">Governança</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {categoryScores.governance}
            </div>
            <Progress value={categoryScores.governance} className="mb-2" />
            <Badge variant="outline" className="text-green-600 border-green-600">Governança</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-blue-600">Design</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {categoryScores.design}
            </div>
            <Progress value={categoryScores.design} className="mb-2" />
            <Badge variant="outline" className="text-blue-600 border-blue-600">Design</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-yellow-600">Materiais</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {categoryScores.materials}
            </div>
            <Progress value={categoryScores.materials} className="mb-2" />
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">Materiais</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-orange-600">Resíduos</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {categoryScores.waste}
            </div>
            <Progress value={categoryScores.waste} className="mb-2" />
            <Badge variant="outline" className="text-orange-600 border-orange-600">Resíduos</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-purple-600">Energia</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {categoryScores.energy}
            </div>
            <Progress value={categoryScores.energy} className="mb-2" />
            <Badge variant="outline" className="text-purple-600 border-purple-600">Energia</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-cyan-600">Água</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-cyan-600 mb-2">
              {categoryScores.water}
            </div>
            <Progress value={categoryScores.water} className="mb-2" />
            <Badge variant="outline" className="text-cyan-600 border-cyan-600">Água</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2" />
            Recomendações de Melhoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recommendations.slice(0, 3).map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm flex items-center justify-center mr-3 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-sm text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={onDownloadReport} className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Baixar Relatório
        </Button>
        <Button onClick={onScheduleConsultation} variant="outline" className="flex-1">
          <Calendar className="h-4 w-4 mr-2" />
          Agendar Consultoria
        </Button>
      </div>
    </div>
  );
};
