
"use client";

import type { StudentResult } from "@/types/entities";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users } from "lucide-react";

interface ResultsTableProps {
  results: StudentResult[];
}

const getInitials = (name?: string, lastName?: string) => {
  if (!name) return "??";
  return `${name.charAt(0)}${lastName ? lastName.charAt(0) : ''}`.toUpperCase();
};

export default function ResultsTable({ results }: ResultsTableProps) {
  if (!results || results.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="mx-auto h-16 w-16 opacity-50 mb-4" />
        No hay resultados para mostrar.
      </div>
    );
  }

  // Ensure results are sorted by ranking for display
  const sortedResults = [...results].sort((a, b) => a.ranking - b.ranking);

  return (
    <ScrollArea className="h-[400px] rounded-md border shadow-md">
      <Table>
        <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
          <TableRow>
            <TableHead className="w-[80px] text-center">Ranking</TableHead>
            <TableHead>Estudiante</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="hidden sm:table-cell">Celular</TableHead>
            <TableHead className="text-right">Puntos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedResults.map((result) => (
            <TableRow key={result.student.id}>
              <TableCell className="font-medium text-center text-lg">#{result.ranking}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage 
                      src={`https://placehold.co/40x40.png?text=${getInitials(result.student.name, result.student.last_name)}`} 
                      alt={result.student.name} 
                      data-ai-hint="person student"
                    />
                    <AvatarFallback>{getInitials(result.student.name, result.student.last_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{result.student.name} {result.student.last_name}</div>
                    <div className="text-xs text-muted-foreground sm:hidden">{result.student.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">{result.student.email}</TableCell>
              <TableCell className="hidden sm:table-cell">{result.student.cel_phone || "N/A"}</TableCell>
              <TableCell className="text-right font-semibold text-primary">{result.obtained_points}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
