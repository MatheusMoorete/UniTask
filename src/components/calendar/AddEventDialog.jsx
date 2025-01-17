import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const eventTypes = [
  { value: 'task', label: 'Tarefa' },
  { value: 'exam', label: 'Prova' },
  { value: 'assignment', label: 'Trabalho' },
  { value: 'other', label: 'Outro' },
];

export function AddEventDialog({ isOpen, onClose, onSave, selectedDates }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('task');

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      type,
    });

    setTitle('');
    setType('task');
    onClose();
  };

  const formatDateRange = () => {
    if (!selectedDates) return '';

    const { start, end } = selectedDates;
    const isSameDay = start.toDateString() === end.toDateString();

    if (isSameDay) {
      return format(start, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    }

    return `${format(start, "dd 'de' MMMM", { locale: ptBR })} - ${format(
      end,
      "dd 'de' MMMM 'de' yyyy",
      { locale: ptBR }
    )}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Evento</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Título
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="Digite o título do evento"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Tipo
            </Label>
            <Select
              value={type}
              onValueChange={setType}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((eventType) => (
                  <SelectItem key={eventType.value} value={eventType.value}>
                    {eventType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Data</Label>
            <div className="col-span-3 text-sm text-muted-foreground">
              {formatDateRange()}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 