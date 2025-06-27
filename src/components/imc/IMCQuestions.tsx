import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

interface Question {
  id: string;
  category: string;
  question: string;
  options: { value: string; label: string; points: number }[];
}

interface IMCQuestionsProps {
  questions: Question[];
  answers: Record<string, string>;
  onAnswerChange: (questionId: string, value: string) => void;
  currentQuestion: number;
}

export const IMCQuestions: React.FC<IMCQuestionsProps> = ({
  questions,
  answers,
  onAnswerChange,
  currentQuestion
}) => {
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0 mb-3">
          <CardTitle className="text-lg sm:text-xl">
            Questão {currentQuestion + 1} de {questions.length}
          </CardTitle>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full self-start sm:self-auto">
            {question.category}
          </span>
        </div>
        <Progress value={progress} className="mb-4" />
        <CardDescription className="text-base font-medium text-gray-900 leading-relaxed">
          {question.question}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={answers[question.id] || ''}
          onValueChange={(value) => onAnswerChange(question.id, value)}
          className="space-y-3"
        >
          {question.options.map((option) => (
            <div key={option.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
              <Label 
                htmlFor={option.value} 
                className="text-sm sm:text-base leading-relaxed cursor-pointer flex-1"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};
