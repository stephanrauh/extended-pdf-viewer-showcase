import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

export async function convertMDToTable(file: string, httpClient: HttpClient): Promise<Array<any>> {
  const source = await firstValueFrom(
    httpClient.get(file, {
      responseType: 'text',
    })
  );
  const lines = splitLines(removeHeader(source));
  return lines.map((line) => parseColumns(line));
}


function removeHeader(raw: string): string {
  const parts = raw.split('------------------- |');
  return parts[parts.length - 1];
}

function splitLines(raw: string): Array<string> {
  return raw.trim().split('\n');
}

function parseColumns(line: string): object {
  const columns = line.split('|');

  let description = "";
  let defaultValue = "";
  if (columns.length === 5) {
    description = findLinks(addCodeTags(columns[3].trim()));
    defaultValue = addCodeTags(columns[2].trim());
  } else {
    description = findLinks(addCodeTags(columns[2].trim()));
    defaultValue = "";
  }

  return {
    attribute: strikeThrough(columns[1].trim()),
    defaultValue,
    description
  };
}

function addCodeTags(text: string): string {
  const fragments = text.split('`');
  let result = fragments[0];
  for (let i = 1; i < fragments.length; i++) {
    if (i % 2 === 1) {
      result += '<code>';
    } else {
      result += '</code>';
    }
    result += fragments[i];
  }
  return result;
}

function findLinks(text: string): string {
  const s1 = text.indexOf('[');
  const s2 = text.indexOf(']');
  const b1 = text.indexOf('(');
  const b2 = text.indexOf(')');
  if (s1 >= 0 && s2 > s1 && b1 === s2 + 1 && b2 > b1) {
    const link = text.substring(s1 + 1, s2);
    const caption = text.substring(b1 + 1, b2);
    text = text.substring(0, s1) + '<a target="#" href="' + link + '">' + caption + '</a>' + text.substring(b2 + 1);
    return findLinks(text);
  }
  return text;
}

function strikeThrough(text: string): string {
  if (text.startsWith('~~') && text.endsWith('~~')) {
    text = text.replace('~~', '');
    text = text.replace('~~', '');
    return '<s>' + text + '</s>';
  }
  return text;
}

export const compareFunction = (dir: number, a: string, b: string) => {
  a = a.replace('[', '').replace(']', '').replace('(', '').replace(')', '').replace('<s>', '').replace('</s>', '');
  b = b.replace('[', '').replace(']', '').replace('(', '').replace(')', '').replace('<s>', '').replace('</s>', '');
  if (dir === 1) {
    return a.localeCompare(b);
  }
  return b.localeCompare(a);
};
