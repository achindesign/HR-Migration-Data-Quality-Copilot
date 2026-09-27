import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  AlertTriangle,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { ValidationRule, RuleCategory, IssueSeverity } from '../../types';

interface ValidationRulesViewProps {
  rules: ValidationRule[];
  onUpdateRules: (rules: ValidationRule[]) => void;
  onRerunValidation: () => void;
}

export const ValidationRulesView: React.FC<ValidationRulesViewProps> = ({
  rules,
  onUpdateRules,
  onRerunValidation,
}) => {
  const [showBuilder, setShowBuilder] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Rule Builder Form State
  const [newField, setNewField] = useState('Salary');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<RuleCategory>('Business Rule');
  const [newOperator, setNewOperator] = useState<ValidationRule['operator']>('positive_number');
  const [newSeverity, setNewSeverity] = useState<IssueSeverity>('High');
  const [newDescription, setNewDescription] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const toggleRule = (id: string) => {
    const updated = rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    onUpdateRules(updated);
    onRerunValidation();
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newMessage.trim()) return;

    const newRule: ValidationRule = {
      id: `CRULE-${Date.now().toString().slice(-4)}`,
      field: newField,
      name: newName,
      category: newCategory,
      operator: newOperator,
      severity: newSeverity,
      description: newDescription || newName,
      message: newMessage,
      enabled: true,
      canAutoFix: true,
    };

    onUpdateRules([...rules, newRule]);
    onRerunValidation();

    // Reset Form
    setNewName('');
    setNewDescription('');
    setNewMessage('');
    setShowBuilder(false);
  };

  const deleteRule = (id: string) => {
    const updated = rules.filter((r) => r.id !== id);
    onUpdateRules(updated);
    onRerunValidation();
  };

  const categories = ['ALL', 'Completeness', 'Validity', 'Uniqueness', 'Consistency', 'Referential Integrity', 'Business Rule'];
  const filteredRules = filterCategory === 'ALL' ? rules : rules.filter((r) => r.category === filterCategory);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Validation Rules & Rule Builder</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure active deterministic rules or build enterprise business logic constraints with automated severity routing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBuilder(!showBuilder)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Custom Rule</span>
          </button>
        </div>
      </div>

      {/* Rule Builder Panel */}
      {showBuilder && (
        <form
          onSubmit={handleAddRule}
          className="p-6 bg-white rounded-2xl border-2 border-indigo-500/40 shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Custom Validation Rule Builder</h3>
            <span className="text-xs text-indigo-600 font-semibold">Immediate Execution</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Field</label>
              <select
                value={newField}
                onChange={(e) => setNewField(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              >
                <option value="Employee_ID">Employee_ID</option>
                <option value="First_Name">First_Name</option>
                <option value="Last_Name">Last_Name</option>
                <option value="Email">Email</option>
                <option value="Salary">Salary</option>
                <option value="Currency">Currency</option>
                <option value="Department_ID">Department_ID</option>
                <option value="Manager_ID">Manager_ID</option>
                <option value="Hire_Date">Hire_Date</option>
                <option value="Termination_Date">Termination_Date</option>
                <option value="Employment_Status">Employment_Status</option>
                <option value="Cost_Center">Cost_Center</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Rule Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as RuleCategory)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Completeness">Completeness</option>
                <option value="Validity">Validity</option>
                <option value="Uniqueness">Uniqueness</option>
                <option value="Consistency">Consistency</option>
                <option value="Referential Integrity">Referential Integrity</option>
                <option value="Business Rule">Business Rule</option>
                <option value="Transformation">Transformation</option>
                <option value="Security">Security</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Severity Rating</label>
              <select
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value as IssueSeverity)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
              >
                <option value="Critical">Critical (Blocks Staging)</option>
                <option value="High">High (Requires Review)</option>
                <option value="Medium">Medium (Warning)</option>
                <option value="Low">Low (Informational)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Operator / Condition</label>
              <select
                value={newOperator}
                onChange={(e) => setNewOperator(e.target.value as ValidationRule['operator'])}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="not_null">Cannot be NULL / Empty</option>
                <option value="valid_email">RFC 5322 Valid Email Syntax</option>
                <option value="positive_number">Numeric &gt; 0</option>
                <option value="valid_currency">Sanctioned ISO Currency (USD, CAD, GBP, EUR)</option>
                <option value="term_after_hire">Termination_Date &gt; Hire_Date</option>
                <option value="ref_manager_exists">Manager must exist in Roster</option>
                <option value="ref_department_exists">Department must exist in Org table</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Rule Name</label>
              <input
                type="text"
                placeholder="e.g. Mandatory Cost Center Format Check"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="md:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">Failure Error Message</label>
              <input
                type="text"
                placeholder="e.g. Cost center must adhere to prefix CC- and 5 digits"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowBuilder(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition"
            >
              Save & Execute Rule
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterCategory === cat
                ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="py-3 px-4 text-center w-16">Active</th>
              <th className="py-3 px-4 text-left">Rule Name & Code</th>
              <th className="py-3 px-4 text-left">Target Field</th>
              <th className="py-3 px-4 text-center">Category</th>
              <th className="py-3 px-4 text-center">Severity</th>
              <th className="py-3 px-4 text-left">Business Logic Description</th>
              <th className="py-3 px-4 text-center w-16">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRules.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/70 transition">
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => toggleRule(r.id)}
                    className="text-slate-400 hover:text-indigo-600 transition"
                  >
                    {r.enabled ? (
                      <ToggleRight className="w-6 h-6 text-indigo-600 fill-indigo-100" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-300" />
                    )}
                  </button>
                </td>
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-900">{r.name}</div>
                  <div className="text-[10px] font-mono text-slate-400">{r.id}</div>
                </td>
                <td className="py-3 px-4 font-mono font-semibold text-slate-700">{r.field}</td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                    {r.category}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      r.severity === 'Critical'
                        ? 'bg-rose-100 text-rose-700'
                        : r.severity === 'High'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {r.severity}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600 max-w-sm">
                  <div>{r.description}</div>
                  <div className="text-[11px] text-slate-400 italic mt-0.5">"{r.message}"</div>
                </td>
                <td className="py-3 px-4 text-center">
                  {r.id.startsWith('CRULE-') && (
                    <button
                      onClick={() => deleteRule(r.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                      title="Delete custom rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
