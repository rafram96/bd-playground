'use client';

import React, { useState, useMemo } from 'react';

interface CostMetrics {
  heap: number;
  sorted: number;
  hash: number;
  bTree: number;
}

interface FormulaDisplay {
  heap: string;
  sorted: string;
  hash: string;
  bTree: string;
}

type Operation = 'fullScan' | 'equality' | 'range' | 'insert' | 'delete';

export default function CostComparatorViz() {
  const [pageCount, setPageCount] = useState(1000);
  const [fanOut, setFanOut] = useState(100);
  const [selectedOp, setSelectedOp] = useState<Operation>('fullScan');

  // Computed values
  const logFB = Math.log(pageCount) / Math.log(fanOut);
  const halfB = pageCount / 2;
  const log2B = Math.log2(pageCount);
  const rangePercentage = 0.1;

  // Calculate costs based on selected operation
  const costs: CostMetrics = useMemo(() => {
    switch (selectedOp) {
      case 'fullScan':
        return {
          heap: pageCount,
          sorted: pageCount,
          hash: pageCount,
          bTree: pageCount,
        };
      case 'equality':
        return {
          heap: halfB,
          sorted: log2B,
          hash: 1.2,
          bTree: logFB,
        };
      case 'range':
        return {
          heap: pageCount,
          sorted: log2B + rangePercentage * pageCount,
          hash: pageCount,
          bTree: logFB + rangePercentage * pageCount,
        };
      case 'insert':
        return {
          heap: 2,
          sorted: pageCount,
          hash: 2,
          bTree: logFB + 2,
        };
      case 'delete':
        return {
          heap: halfB + 1,
          sorted: pageCount,
          hash: 2,
          bTree: logFB + 2,
        };
      default:
        return { heap: 0, sorted: 0, hash: 0, bTree: 0 };
    }
  }, [selectedOp, pageCount, fanOut, logFB, halfB, log2B]);

  // Display formulas
  const formulas: FormulaDisplay = useMemo(() => {
    switch (selectedOp) {
      case 'fullScan':
        return {
          heap: 'B',
          sorted: 'B',
          hash: 'B',
          bTree: 'B',
        };
      case 'equality':
        return {
          heap: 'B/2',
          sorted: 'log₂(B)',
          hash: '~1.2',
          bTree: `log_F(B)`,
        };
      case 'range':
        return {
          heap: 'B',
          sorted: 'log₂(B) + 0.1B',
          hash: 'B',
          bTree: 'log_F(B) + 0.1B',
        };
      case 'insert':
        return {
          heap: '2',
          sorted: 'B',
          hash: '2',
          bTree: 'log_F(B) + 2',
        };
      case 'delete':
        return {
          heap: 'B/2 + 1',
          sorted: 'B',
          hash: '2',
          bTree: 'log_F(B) + 2',
        };
      default:
        return { heap: '', sorted: '', hash: '', bTree: '' };
    }
  }, [selectedOp]);

  // Find winner (minimum cost)
  const winner = useMemo(() => {
    const costs_arr = [
      { name: 'heap', value: costs.heap },
      { name: 'sorted', value: costs.sorted },
      { name: 'hash', value: costs.hash },
      { name: 'bTree', value: costs.bTree },
    ];
    return costs_arr.reduce((min, cur) => (cur.value < min.value ? cur : min));
  }, [costs]);

  // Use log scale for very large differences
  const maxCost = Math.max(costs.heap, costs.sorted, costs.hash, costs.bTree);
  const scale = Math.max(1, Math.log10(maxCost + 1)); // Log scale for display

  const getBarWidth = (value: number) => {
    if (scale <= 2) return (value / (maxCost || 1)) * 100;
    return (Math.log10(value + 1) / scale) * 100;
  };

  const getInsight = () => {
    const operationNames: Record<Operation, string> = {
      fullScan: 'Escaneo Completo',
      equality: 'Búsqueda por Igualdad',
      range: 'Búsqueda por Rango',
      insert: 'Inserción',
      delete: 'Eliminación',
    };

    const opName = operationNames[selectedOp];
    const winnerName = {
      heap: 'Heap File',
      sorted: 'Archivo Ordenado',
      hash: 'Hash Estático',
      bTree: 'B+Tree',
    }[winner.name];

    if (selectedOp === 'fullScan') {
      return `Todas las estructuras deben recorrer las ${pageCount.toLocaleString()} páginas para ${opName}. El rendimiento es idéntico.`;
    }
    if (selectedOp === 'equality') {
      if (winner.name === 'hash') {
        return `${winnerName} gana con ~1.2 I/Os mediante acceso directo al bucket, superando la profundidad del B+Tree de ${logFB.toFixed(1)}.`;
      }
      if (winner.name === 'bTree') {
        return `${winnerName} gana con altura log₁₀₀(${pageCount}) = ${logFB.toFixed(1)}, requiriendo solo ~${Math.ceil(logFB)} lecturas de página.`;
      }
      return `${winnerName} logra el menor costo para búsqueda por igualdad con búsqueda óptima de clave.`;
    }
    if (selectedOp === 'range') {
      if (winner.name === 'bTree') {
        return `${winnerName} gana combinando recorrido del árbol (${logFB.toFixed(1)}) con escaneo eficiente de hojas (${(rangePercentage * pageCount).toFixed(0)} páginas).`;
      }
      if (winner.name === 'sorted') {
        return `${winnerName} gana con búsqueda binaria (${log2B.toFixed(1)}) más escaneo secuencial de rango (${(rangePercentage * pageCount).toFixed(0)} páginas).`;
      }
      return `${winnerName} maneja eficientemente consultas por rango con acceso secuencial.`;
    }
    if (selectedOp === 'insert') {
      if (winner.name === 'heap') {
        return `${winnerName} gana con solo 2 I/Os (encontrar página libre + escribir), evitando reorganizaciones costosas.`;
      }
      if (winner.name === 'hash') {
        return `${winnerName} gana con 2 I/Os (hash + escritura), mucho más rápido que los ${pageCount.toLocaleString()} desplazamientos del Archivo Ordenado.`;
      }
      if (winner.name === 'bTree') {
        return `${winnerName} balancea recorrido del árbol (${logFB.toFixed(1)}) con costo de escritura, superando los desplazamientos costosos del Archivo Ordenado.`;
      }
      return `${winnerName} minimiza el costo de inserción comparado con otras estructuras.`;
    }
    if (selectedOp === 'delete') {
      if (winner.name === 'hash') {
        return `${winnerName} gana con 2 I/Os (hash lookup + eliminación), superando los ${pageCount.toLocaleString()} desplazamientos del Archivo Ordenado.`;
      }
      if (winner.name === 'bTree') {
        return `${winnerName} combina búsqueda eficiente (${logFB.toFixed(1)}) con mínima reorganización.`;
      }
      return `${winnerName} minimiza el costo de eliminación con búsqueda y remoción eficiente.`;
    }
    return '';
  };

  const structures = [
    { key: 'heap', label: 'Heap File', color: '#6b7280', cost: costs.heap },
    { key: 'sorted', label: 'Archivo Ordenado', color: '#3b82f6', cost: costs.sorted },
    { key: 'hash', label: 'Hash Estático', color: '#f59e0b', cost: costs.hash },
    { key: 'bTree', label: 'B+Tree', color: '#22d3a0', cost: costs.bTree },
  ] as const;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-base)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-ui)',
        padding: '32px',
        borderRadius: '8px',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 600,
            margin: '0 0 8px 0',
            color: 'var(--text-primary)',
          }}
        >
          Comparador de Costos I/O
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Visualiza cuántas operaciones de I/O requiere cada estructura de datos
          para distintos tipos de consultas.
        </p>
      </div>

      {/* Configuration Panel */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}
        >
          {/* Pages Slider */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Número de páginas (B): {pageCount.toLocaleString()}
            </label>
            <input
              type="range"
              min="10"
              max="10000"
              value={pageCount}
              onChange={(e) => setPageCount(Number(e.target.value))}
              style={{
                width: '100%',
                height: '6px',
                background: 'var(--bg-elevated)',
                outline: 'none',
                borderRadius: '3px',
                appearance: 'none',
                WebkitAppearance: 'none',
              }}
            />
            <style>{`
              input[type="range"]::-webkit-slider-thumb {
                appearance: none;
                -webkit-appearance: none;
                width: 16px;
                height: 16px;
                background: var(--accent);
                cursor: pointer;
                border-radius: 50%;
                border: 2px solid var(--bg-base);
              }
              input[type="range"]::-moz-range-thumb {
                width: 16px;
                height: 16px;
                background: var(--accent);
                cursor: pointer;
                border-radius: 50%;
                border: 2px solid var(--bg-base);
              }
            `}</style>
          </div>

          {/* Fan-out Slider */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Fan-out B+Tree (F): {fanOut}
            </label>
            <input
              type="range"
              min="50"
              max="200"
              value={fanOut}
              onChange={(e) => setFanOut(Number(e.target.value))}
              style={{
                width: '100%',
                height: '6px',
                background: 'var(--bg-elevated)',
                outline: 'none',
                borderRadius: '3px',
                appearance: 'none',
                WebkitAppearance: 'none',
              }}
            />
          </div>

          {/* Computed Values */}
          <div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Valores Computados
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                fontSize: '12px',
              }}
            >
              <div style={{ color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>log_F(B)</span>
                <div style={{ color: 'var(--accent)', fontSize: '14px', fontWeight: 600 }}>
                  {logFB.toFixed(2)}
                </div>
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>B/2</span>
                <div style={{ color: 'var(--accent)', fontSize: '14px', fontWeight: 600 }}>
                  {Math.round(halfB).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operation Selector */}
      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Operación
        </div>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          {[
            { id: 'fullScan', label: 'Escaneo Completo' },
            { id: 'equality', label: 'Búsqueda Igualdad' },
            { id: 'range', label: 'Búsqueda Rango' },
            { id: 'insert', label: 'Inserción' },
            { id: 'delete', label: 'Eliminación' },
          ].map((op) => (
            <button
              key={op.id}
              onClick={() => setSelectedOp(op.id as Operation)}
              style={{
                padding: '8px 16px',
                backgroundColor:
                  selectedOp === op.id ? 'var(--accent)' : 'var(--bg-surface)',
                color:
                  selectedOp === op.id ? 'var(--bg-base)' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-ui)',
              }}
              onMouseEnter={(e) => {
                if (selectedOp !== op.id) {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    'var(--bg-elevated)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedOp !== op.id) {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    'var(--bg-surface)';
                }
              }}
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bar Chart */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        {structures.map((struct) => (
          <div key={struct.key} style={{ marginBottom: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500 }}>
                  {struct.label}
                </span>
                {struct.key === winner.name && (
                  <span
                    style={{
                      fontSize: '14px',
                      color: 'var(--success)',
                    }}
                  >
                    ★
                  </span>
                )}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {formulas[struct.key as keyof typeof formulas]}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: '32px',
                  backgroundColor: 'var(--bg-elevated)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${getBarWidth(struct.cost)}%`,
                    backgroundColor: struct.color,
                    transition: 'width 0.5s ease',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    paddingRight: '12px',
                    justifyContent: 'flex-end',
                    position: 'relative',
                  }}
                >
                  {getBarWidth(struct.cost) > 15 && (
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color:
                          struct.color === '#3b82f6' ||
                          struct.color === '#22d3a0'
                            ? 'var(--bg-base)'
                            : 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {struct.cost.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
              <span
                style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  minWidth: '45px',
                  textAlign: 'right',
                }}
              >
                {struct.cost.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Insight Box */}
      <div
        style={{
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '16px',
          borderLeft: `4px solid ${
            {
              heap: '#6b7280',
              sorted: '#3b82f6',
              hash: '#f59e0b',
              bTree: '#22d3a0',
            }[winner.name]
          }`,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
          }}
        >
          <strong style={{ color: 'var(--text-primary)' }}>Análisis:</strong>{' '}
          {getInsight()}
        </p>
      </div>
    </div>
  );
}
