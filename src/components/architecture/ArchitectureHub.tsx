import React, { useState } from 'react';
import {
  Database,
  Layers,
  Code2,
  Terminal,
  FolderTree,
  Copy,
  Check,
  Play,
  ArrowRight,
  Server,
  Smartphone,
  CreditCard,
  Truck
} from 'lucide-react';
import {
  PRISMA_SCHEMA,
  POSTGRES_SQL_DDL,
  ERD_ENTITIES,
  SYSTEM_ARCHITECTURE_LAYERS,
  PROJECT_FOLDER_STRUCTURE,
  REST_API_ENDPOINTS,
  FLUTTER_CODE_SNIPPET,
  BKASH_BACKEND_CONTROLLER,
  STEADFAST_COURIER_SERVICE
} from '../../data/architectureDocs';
import {
  NEXT_HOME_PAGE_CODE,
  NEXT_PDP_PAGE_CODE,
  NEXT_PDP_CLIENT_CODE,
  NEXT_CART_STORE_CODE,
  NEXT_CART_DRAWER_CODE
} from '../../data/nextCodeSnippets';
import {
  BKASH_BACKEND_CONTROLLER_CODE,
  STEADFAST_COURIER_SERVICE_CODE,
  EXPRESS_API_ROUTES_CODE
} from '../../data/backendSnippets';
import { useApp } from '../../context/AppContext';

export const ArchitectureHub: React.FC = () => {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'schema' | 'erd' | 'api' | 'code' | 'structure' | 'system'>('code');
  const [schemaFormat, setSchemaFormat] = useState<'prisma' | 'sql'>('prisma');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // ERD selected entity
  const [selectedEntity, setSelectedEntity] = useState<string>('Order');

  // API Tester state
  const [selectedApiGroupIdx, setSelectedApiGroupIdx] = useState(0);
  const [selectedApiEndpointIdx, setSelectedApiEndpointIdx] = useState(0);
  const [apiResponseOutput, setApiResponseOutput] = useState<any>(null);
  const [apiIsLoading, setApiIsLoading] = useState(false);

  // Code snippet tab
  const [codeSnippetTab, setCodeSnippetTab] = useState<
    'bkash' | 'steadfast' | 'express-routes' | 'next-home' | 'next-pdp' | 'next-cart-store' | 'next-cart-drawer' | 'flutter'
  >('bkash');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleTestApi = () => {
    const currentEndpoint = REST_API_ENDPOINTS[selectedApiGroupIdx].endpoints[selectedApiEndpointIdx];
    setApiIsLoading(true);
    setApiResponseOutput(null);

    setTimeout(() => {
      setApiIsLoading(false);
      setApiResponseOutput({
        statusCode: currentEndpoint.method === 'POST' ? 201 : 200,
        statusText: currentEndpoint.method === 'POST' ? 'Created' : 'OK',
        executionTimeMs: Math.floor(45 + Math.random() * 80),
        timestamp: new Date().toISOString(),
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'x-powered-by': 'Express / BazaarPulse API Gateway',
          'rate-limit-remaining': '98'
        },
        data: currentEndpoint.sampleResponse
      });
    }, 450);
  };

  const activeGroup = REST_API_ENDPOINTS[selectedApiGroupIdx];
  const activeEndpoint = activeGroup.endpoints[selectedApiEndpointIdx];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {/* Hero / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-600 text-white font-mono text-xs px-2.5 py-0.5 rounded font-bold uppercase">
              System Architecture & Data Modeling
            </span>
            <span className="text-xs text-slate-500 font-mono">PostgreSQL · Prisma · REST · Flutter</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
            Database Schema & Full-Stack Blueprint
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Production-grade PostgreSQL database models, Entity Relationship Diagrams (ERD), RESTful API specifications, and Flutter / Node.js integration handlers.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'schema'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            <span>Prisma Schema</span>
          </button>

          <button
            onClick={() => setActiveTab('erd')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'erd'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-sky-500" />
            <span>Interactive ERD</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'api'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-amber-500" />
            <span>REST API Console</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'code'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Clean Code Snippets</span>
          </button>

          <button
            onClick={() => setActiveTab('structure')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'structure'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5 text-rose-500" />
            <span>Folder Architecture</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'system'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-purple-500" />
            <span>System Layers</span>
          </button>
        </div>
      </div>

      {/* 1. PRISMA SCHEMA & SQL VIEW */}
      {activeTab === 'schema' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                <button
                  onClick={() => setSchemaFormat('prisma')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    schemaFormat === 'prisma'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Prisma Schema (schema.prisma)
                </button>
                <button
                  onClick={() => setSchemaFormat('sql')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    schemaFormat === 'sql'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  PostgreSQL DDL (schema.sql)
                </button>
              </div>

              <span className="text-xs text-slate-500 hidden md:inline">
                {schemaFormat === 'prisma'
                  ? '15 Models · 9 Enums · Foreign Keys · Gin Trigram Indexes'
                  : 'PostgreSQL 15/16 DDL · Constraints & Full-Text Search Indexes'}
              </span>
            </div>

            <button
              onClick={() => {
                const content = schemaFormat === 'prisma' ? PRISMA_SCHEMA : POSTGRES_SQL_DDL;
                copyToClipboard(content, schemaFormat);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors shadow-sm self-start sm:self-auto"
            >
              {copiedKey === schemaFormat ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === schemaFormat ? 'Copied' : `Copy ${schemaFormat === 'prisma' ? 'Prisma Schema' : 'PostgreSQL SQL'}`}</span>
            </button>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-slate-300">
                  {schemaFormat === 'prisma' ? 'prisma/schema.prisma (Prisma 6.x)' : 'prisma/schema.sql (PostgreSQL 16)'}
                </span>
              </div>
              <span className="font-mono text-[11px]">
                {schemaFormat === 'prisma' ? 'PostgreSQL Provider' : 'Standard SQL / DDL'}
              </span>
            </div>

            <pre className="p-6 text-xs font-mono text-slate-200 overflow-x-auto max-h-[640px] leading-relaxed select-text">
              <code>{schemaFormat === 'prisma' ? PRISMA_SCHEMA : POSTGRES_SQL_DDL}</code>
            </pre>
          </div>
        </div>
      )}

      {/* 2. INTERACTIVE ERD VISUALIZER */}
      {activeTab === 'erd' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900 text-xs text-sky-900 dark:text-sky-300">
            <strong>Interactive Entity Relationship Diagram (ERD):</strong> Click on any table below to inspect its schema attributes, foreign key references, and business rules.
          </div>

          {/* Interactive Entity selector pills */}
          <div className="flex flex-wrap gap-2">
            {ERD_ENTITIES.map(entity => (
              <button
                key={entity.name}
                onClick={() => setSelectedEntity(entity.name)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  selectedEntity === entity.name
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                {entity.name}
              </button>
            ))}
          </div>

          {/* Graphical Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ERD_ENTITIES.map(entity => {
              const isSelected = selectedEntity === entity.name;
              return (
                <div
                  key={entity.name}
                  onClick={() => setSelectedEntity(entity.name)}
                  className={`rounded-2xl border transition-all cursor-pointer overflow-hidden bg-white dark:bg-slate-800/90 shadow-sm ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className={`p-4 border-b ${
                    isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700'
                  }`}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-mono font-bold text-sm">{entity.name}</h3>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                        isSelected ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        Table
                      </span>
                    </div>
                    <p className={`text-[11px] mt-1 line-clamp-1 ${
                      isSelected ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {entity.description}
                    </p>
                  </div>

                  <div className="p-4 space-y-2">
                    {entity.fields.map(f => (
                      <div key={f.name} className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-1.5">
                          {f.isPk && <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-1 rounded">PK</span>}
                          {f.isFk && <span className="text-[10px] bg-indigo-500 text-white font-bold px-1 rounded">FK</span>}
                          {f.isUnique && <span className="text-[10px] bg-sky-500 text-white font-bold px-1 rounded">UQ</span>}
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{f.name}</span>
                        </div>
                        <span className="text-slate-400 text-[11px]">{f.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. REST API ENDPOINTS & LIVE CONSOLE */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Endpoint Catalog Navigation (4 Cols) */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                API Service Groups
              </h3>

              <div className="space-y-4">
                {REST_API_ENDPOINTS.map((grp, gIdx) => (
                  <div key={grp.group} className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">
                      {grp.group}
                    </span>
                    <div className="space-y-1">
                      {grp.endpoints.map((ep, eIdx) => {
                        const isCurrent = selectedApiGroupIdx === gIdx && selectedApiEndpointIdx === eIdx;
                        return (
                          <button
                            key={ep.path}
                            onClick={() => {
                              setSelectedApiGroupIdx(gIdx);
                              setSelectedApiEndpointIdx(eIdx);
                              setApiResponseOutput(null);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center gap-2 ${
                              isCurrent
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <span className={`font-mono font-bold text-[10px] px-1.5 py-0.5 rounded ${
                              ep.method === 'POST'
                                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                : 'bg-sky-500/20 text-sky-600 dark:text-sky-400'
                            }`}>
                              {ep.method}
                            </span>
                            <span className="font-mono text-[11px] truncate flex-1">{ep.path}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Endpoint Test Console & Live Runner (8 Cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                        activeEndpoint.method === 'POST' ? 'bg-emerald-600 text-white' : 'bg-sky-600 text-white'
                      }`}>
                        {activeEndpoint.method}
                      </span>
                      <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                        {activeEndpoint.path}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {activeEndpoint.summary}
                    </p>
                  </div>

                  <button
                    onClick={handleTestApi}
                    disabled={apiIsLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 self-start sm:self-auto"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{apiIsLoading ? 'Executing...' : 'Send Test Request'}</span>
                  </button>
                </div>

                {/* Sample Request Body if POST */}
                {activeEndpoint.sampleRequest && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">
                      Request Payload (JSON)
                    </span>
                    <pre className="p-3 bg-slate-900 text-slate-200 font-mono text-xs rounded-xl overflow-x-auto">
                      {JSON.stringify(activeEndpoint.sampleRequest, null, 2)}
                    </pre>
                  </div>
                )}

                {/* API Response Output */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
                    <span>Server Response</span>
                    {apiResponseOutput && (
                      <span className="text-emerald-600 font-mono">
                        Status: {apiResponseOutput.statusCode} {apiResponseOutput.statusText} · {apiResponseOutput.executionTimeMs}ms
                      </span>
                    )}
                  </div>

                  <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto min-h-[140px] max-h-[320px]">
                    {apiIsLoading ? (
                      <span className="text-slate-500 animate-pulse">Sending request to Express API Gateway...</span>
                    ) : apiResponseOutput ? (
                      JSON.stringify(apiResponseOutput, null, 2)
                    ) : (
                      <span className="text-slate-500">Click "Send Test Request" above to trigger a simulated live HTTP transaction.</span>
                    )}
                  </pre>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* 4. CLEAN CODE SNIPPETS (NEXT.JS, FLUTTER & BACKEND) */}
      {activeTab === 'code' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold overflow-x-auto no-scrollbar">
              <button
                onClick={() => setCodeSnippetTab('next-home')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  codeSnippetTab === 'next-home'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>Next.js Home (page.tsx)</span>
              </button>

              <button
                onClick={() => setCodeSnippetTab('next-pdp')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  codeSnippetTab === 'next-pdp'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>Product Detail (PDP)</span>
              </button>

              <button
                onClick={() => setCodeSnippetTab('next-cart-store')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  codeSnippetTab === 'next-cart-store'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>Zustand Cart Store</span>
              </button>

              <button
                onClick={() => setCodeSnippetTab('next-cart-drawer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  codeSnippetTab === 'next-cart-drawer'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>Cart Drawer Component</span>
              </button>

              <button
                onClick={() => setCodeSnippetTab('flutter')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  codeSnippetTab === 'flutter'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-sky-500" />
                <span>Flutter BLoC</span>
              </button>

              <button
                onClick={() => setCodeSnippetTab('bkash')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  codeSnippetTab === 'bkash'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-[#e2136e]" />
                <span>bKash Controller & Service</span>
              </button>

              <button
                onClick={() => setCodeSnippetTab('steadfast')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  codeSnippetTab === 'steadfast'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Steadfast Courier API</span>
              </button>

              <button
                onClick={() => setCodeSnippetTab('express-routes')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  codeSnippetTab === 'express-routes'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Server className="w-3.5 h-3.5 text-amber-500" />
                <span>Express API Routes</span>
              </button>
            </div>

            <button
              onClick={() => {
                const code =
                  codeSnippetTab === 'bkash'
                    ? BKASH_BACKEND_CONTROLLER_CODE
                    : codeSnippetTab === 'steadfast'
                    ? STEADFAST_COURIER_SERVICE_CODE
                    : codeSnippetTab === 'express-routes'
                    ? EXPRESS_API_ROUTES_CODE
                    : codeSnippetTab === 'next-home'
                    ? NEXT_HOME_PAGE_CODE
                    : codeSnippetTab === 'next-pdp'
                    ? NEXT_PDP_PAGE_CODE + '\n\n' + NEXT_PDP_CLIENT_CODE
                    : codeSnippetTab === 'next-cart-store'
                    ? NEXT_CART_STORE_CODE
                    : codeSnippetTab === 'next-cart-drawer'
                    ? NEXT_CART_DRAWER_CODE
                    : FLUTTER_CODE_SNIPPET;
                copyToClipboard(code, codeSnippetTab);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors shadow-sm self-start sm:self-auto"
            >
              {copiedKey === codeSnippetTab ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === codeSnippetTab ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px] text-slate-300">
                {codeSnippetTab === 'bkash'
                  ? 'src/server/controllers/bkash.controller.ts & services/bkash.service.ts (Node.js/Express + Token Cache + Refund)'
                  : codeSnippetTab === 'steadfast'
                  ? 'src/server/controllers/steadfast.controller.ts & services/steadfast.service.ts (Booking + Tracking + Webhooks)'
                  : codeSnippetTab === 'express-routes'
                  ? 'src/server/routes/api.routes.ts (Express.js Router)'
                  : codeSnippetTab === 'next-home'
                  ? 'frontend-web/src/app/(storefront)/page.tsx (Next.js 15 App Router)'
                  : codeSnippetTab === 'next-pdp'
                  ? 'frontend-web/src/app/(storefront)/products/[slug]/page.tsx & ProductDetailClient.tsx'
                  : codeSnippetTab === 'next-cart-store'
                  ? 'frontend-web/src/store/useCartStore.ts (Zustand + LocalStorage)'
                  : codeSnippetTab === 'next-cart-drawer'
                  ? 'frontend-web/src/components/cart/CartDrawer.tsx (React Client Component)'
                  : 'mobile/lib/features/checkout/presentation/checkout_screen.dart (Dart)'}
              </span>
              <span className="font-mono text-[11px] text-emerald-400">TypeScript / Production</span>
            </div>

            <pre className="p-6 text-xs font-mono text-slate-200 overflow-x-auto max-h-[640px] leading-relaxed select-text">
              <code>
                {codeSnippetTab === 'bkash'
                  ? BKASH_BACKEND_CONTROLLER_CODE
                  : codeSnippetTab === 'steadfast'
                  ? STEADFAST_COURIER_SERVICE_CODE
                  : codeSnippetTab === 'express-routes'
                  ? EXPRESS_API_ROUTES_CODE
                  : codeSnippetTab === 'next-home'
                  ? NEXT_HOME_PAGE_CODE
                  : codeSnippetTab === 'next-pdp'
                  ? NEXT_PDP_PAGE_CODE + '\n\n' + NEXT_PDP_CLIENT_CODE
                  : codeSnippetTab === 'next-cart-store'
                  ? NEXT_CART_STORE_CODE
                  : codeSnippetTab === 'next-cart-drawer'
                  ? NEXT_CART_DRAWER_CODE
                  : FLUTTER_CODE_SNIPPET}
              </code>
            </pre>
          </div>
        </div>
      )}

      {/* 5. MODULAR PROJECT FOLDER STRUCTURE */}
      {activeTab === 'structure' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Enterprise monorepo structure covering Next.js Frontend, Node.js API Gateway, and Flutter Mobile client.
            </div>

            <button
              onClick={() => copyToClipboard(PROJECT_FOLDER_STRUCTURE, 'structure')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
            >
              {copiedKey === 'structure' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'structure' ? 'Copied' : 'Copy Architecture'}</span>
            </button>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
            <pre className="p-6 text-xs font-mono text-emerald-400 overflow-x-auto max-h-[640px] leading-relaxed">
              <code>{PROJECT_FOLDER_STRUCTURE}</code>
            </pre>
          </div>
        </div>
      )}

      {/* 6. MULTI-TIER SYSTEM ARCHITECTURE */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {SYSTEM_ARCHITECTURE_LAYERS.map(layer => (
              <div
                key={layer.layer}
                className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {layer.layer}
                  </h3>
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-md">
                    {layer.tech}
                  </span>
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                  {layer.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
