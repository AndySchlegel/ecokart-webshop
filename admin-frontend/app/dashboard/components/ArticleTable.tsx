'use client';

import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table';

import type { Article } from '@/lib/articles';

type ArticleTableProps = {
  articles: Article[];
  onDelete: (id: string) => Promise<void>;
  onEdit: (article: Article) => void;
};

export function ArticleTable({ articles, onDelete, onEdit }: ArticleTableProps) {
  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Wirklich "${name}" löschen?`)) {
      return;
    }
    await onDelete(id);
  }

  // Define columns with TanStack Table
  const columnHelper = createColumnHelper<Article>();

  const columns = useMemo<ColumnDef<Article, any>[]>(
    () => [
      columnHelper.accessor('imageUrl', {
        header: 'Bild',
        cell: (info) => (
          <img
            src={info.getValue()}
            alt={info.row.original.name}
            style={{
              width: '48px',
              height: '48px',
              objectFit: 'cover',
              borderRadius: '4px',
              border: '1px solid var(--bg-darker)'
            }}
          />
        ),
        size: 80,
      }),
      columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => info.getValue(),
        size: 200,
      }),
      columnHelper.accessor('price', {
        header: 'Preis',
        cell: (info) => `${info.getValue().toFixed(2)} €`,
        size: 100,
      }),
      columnHelper.accessor('category', {
        header: 'Kategorie',
        cell: (info) => info.getValue() || '–',
        size: 120,
      }),
      columnHelper.accessor('rating', {
        header: 'Rating',
        cell: (info) => {
          const rating = info.getValue();
          return rating ? `⭐ ${rating.toFixed(1)}` : '-';
        },
        size: 100,
      }),
      columnHelper.accessor('reviewCount', {
        header: 'Reviews',
        cell: (info) => info.getValue() || 0,
        size: 100,
      }),
      columnHelper.accessor('stock', {
        header: 'Lager',
        cell: (info) => {
          const stock = info.getValue();
          const reserved = info.row.original.reserved;

          if (stock === undefined) return '–';

          return (
            <span style={{
              color: stock <= 0 ? '#dc2626' : stock <= 10 ? '#f59e0b' : '#10b981',
              fontWeight: '600'
            }}>
              {stock} {reserved ? `(${reserved} res.)` : ''}
            </span>
          );
        },
        size: 100,
      }),
      columnHelper.accessor('description', {
        header: 'Beschreibung',
        cell: (info) => info.getValue(),
        size: 300,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Aktionen',
        cell: (info) => (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'nowrap' }}>
            <button
              onClick={() => onEdit(info.row.original)}
              className="button button--secondary"
              type="button"
            >
              Bearbeiten
            </button>
            <button
              onClick={() => void handleDelete(info.row.original.id, info.row.original.name)}
              className="button button--delete"
              type="button"
            >
              Löschen
            </button>
          </div>
        ),
        size: 240,
      }),
    ],
    [onEdit, onDelete]
  );

  const table = useReactTable({
    data: articles,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (articles.length === 0) {
    return (
      <div className="card">
        <h2>Keine Produkte</h2>
        <p>Noch keine Produkte vorhanden. Nutze das Formular unten, um neue anzulegen.</p>
      </div>
    );
  }

  return (
    <>
      {/* Custom styles for TanStack Table */}
      <style jsx global>{`
        /* CRITICAL: Override globals.css responsive table styles */
        .tanstack-table-wrapper table,
        .tanstack-table-wrapper thead,
        .tanstack-table-wrapper tbody,
        .tanstack-table-wrapper tr,
        .tanstack-table-wrapper th,
        .tanstack-table-wrapper td {
          display: table !important;
        }

        .tanstack-table-wrapper thead {
          display: table-header-group !important;
        }

        .tanstack-table-wrapper tbody {
          display: table-row-group !important;
        }

        .tanstack-table-wrapper tr {
          display: table-row !important;
        }

        .tanstack-table-wrapper th,
        .tanstack-table-wrapper td {
          display: table-cell !important;
        }

        @media (max-width: 767px) {
          .tanstack-table-wrapper table,
          .tanstack-table-wrapper thead,
          .tanstack-table-wrapper tbody,
          .tanstack-table-wrapper tr,
          .tanstack-table-wrapper th,
          .tanstack-table-wrapper td {
            display: table !important;
          }

          .tanstack-table-wrapper thead {
            display: table-header-group !important;
          }

          .tanstack-table-wrapper tbody {
            display: table-row-group !important;
          }

          .tanstack-table-wrapper tr {
            display: table-row !important;
            margin: 0 !important;
            border: none !important;
          }

          .tanstack-table-wrapper th,
          .tanstack-table-wrapper td {
            display: table-cell !important;
            position: relative !important;
            padding-left: 1rem !important;
            text-align: left !important;
          }

          .tanstack-table-wrapper td::before {
            display: none !important;
          }
        }
      `}</style>

      <style jsx>{`
        .tanstack-table-container {
          overflow-x: auto !important;
          overflow-y: visible;
          background: var(--bg-dark);
          margin-top: 2rem;
          border-radius: 0;
          box-shadow: 0 8px 32px rgba(255, 107, 0, 0.15);
          -webkit-overflow-scrolling: touch;
          position: relative;
          width: 100%;
          max-width: 100%;
        }

        .tanstack-table {
          width: 100%;
          min-width: 1300px;
          border-collapse: collapse;
          margin: 0;
          position: relative;
        }

        .tanstack-table thead th {
          padding: 1rem;
          text-align: left;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.875rem;
          letter-spacing: 0.1em;
          color: var(--accent-orange);
          white-space: nowrap;
          background: var(--bg-darker);
          border-bottom: 2px solid var(--accent-orange);
          position: sticky;
          top: 0;
          z-index: 2;
        }

        /* Sticky Actions Column - Always visible on right */
        .tanstack-table thead th:last-child {
          position: sticky;
          right: 0;
          z-index: 3;
          background: var(--bg-darker);
          box-shadow: -4px 0 8px rgba(0, 0, 0, 0.3);
        }

        .tanstack-table tbody td {
          padding: 1.25rem 1rem;
          border-bottom: 1px solid var(--bg-darker);
          color: var(--text-light-gray);
          vertical-align: middle;
          background: var(--bg-dark);
        }

        /* Sticky Actions Column Cells */
        .tanstack-table tbody td:last-child {
          position: sticky;
          right: 0;
          z-index: 1;
          background: var(--bg-dark);
          box-shadow: -4px 0 8px rgba(0, 0, 0, 0.3);
        }

        .tanstack-table tbody tr:hover td {
          background: rgba(255, 107, 0, 0.05);
        }

        .tanstack-table tbody tr:hover td:last-child {
          background: rgba(255, 107, 0, 0.05);
        }

        /* Button Container Styling - Prevent wrapping */
        .tanstack-table .button {
          white-space: nowrap;
          min-width: fit-content;
        }

        .tanstack-table .button--secondary {
          border-color: var(--accent-green);
          color: var(--accent-green);
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        .tanstack-table .button--secondary::before {
          background: var(--accent-green);
        }

        @media (max-width: 767px) {
          .tanstack-table-container {
            width: 100%;
            max-width: 100vw;
          }
        }
      `}</style>

      {/* Header Card */}
      <div className="card">
        <h2>Produkte verwalten</h2>
        <p style={{ color: 'var(--text-gray)', marginBottom: 0 }}>
          {articles.length} {articles.length === 1 ? 'Produkt' : 'Produkte'} gefunden
        </p>
      </div>

      {/* TanStack Table */}
      <div className="tanstack-table-wrapper">
        <div className="tanstack-table-container">
          <table className="tanstack-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{
                      width: header.column.columnDef.size
                        ? `${header.column.columnDef.size}px`
                        : undefined,
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{
                      width: cell.column.columnDef.size
                        ? `${cell.column.columnDef.size}px`
                        : undefined,
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
