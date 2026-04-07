import * as chrono from 'chrono-node';

export interface ParsedTask {
  title: string;
  dueDate: Date | null;
  priority: number;
}

export function parseTaskInput(input: string): ParsedTask {
  // Parse date using chrono
  const parsedResults = chrono.parse(input);
  let dueDate: Date | null = null;
  let title = input;

  if (parsedResults.length > 0) {
    const result = parsedResults[0];
    dueDate = result.start.date();
    
    // Remove the parsed date string from the title
    title = input.replace(result.text, '').trim();
    // Clean up extra spaces
    title = title.replace(/\s+/g, ' ');
  }

  // Parse priority (e.g., !1, !2, !3, !4)
  let priority = 4; // Default lowest priority
  const priorityMatch = title.match(/!([1-4])/);
  if (priorityMatch) {
    priority = parseInt(priorityMatch[1], 10);
    title = title.replace(priorityMatch[0], '').trim();
  }

  return {
    title,
    dueDate,
    priority,
  };
}
