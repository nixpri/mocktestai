'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, Search, Download, ChevronRight, FileText } from 'lucide-react'
import Link from 'next/link'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

interface FormulaSection {
  id: string
  title: string
  formulas: {
    name: string
    formula: string
    description?: string
  }[]
}

const formulaSheets: Record<string, FormulaSection[]> = {
  mechanics: [
    {
      id: 'kinematics',
      title: 'Kinematics',
      formulas: [
        {
          name: 'Equations of Motion',
          formula: 'v = u + at',
          description: 'Final velocity with constant acceleration'
        },
        {
          name: 'Displacement',
          formula: 's = ut + \\frac{1}{2}at^2',
          description: 'Displacement with constant acceleration'
        },
        {
          name: 'Third Equation',
          formula: 'v^2 = u^2 + 2as',
          description: 'Velocity-displacement relation'
        },
        {
          name: 'Projectile Motion Range',
          formula: 'R = \\frac{u^2 \\sin 2\\theta}{g}',
          description: 'Horizontal range of projectile'
        },
        {
          name: 'Maximum Height',
          formula: 'H = \\frac{u^2 \\sin^2 \\theta}{2g}',
          description: 'Maximum height of projectile'
        }
      ]
    },
    {
      id: 'dynamics',
      title: 'Laws of Motion',
      formulas: [
        {
          name: "Newton's Second Law",
          formula: 'F = ma',
          description: 'Force equals mass times acceleration'
        },
        {
          name: 'Momentum',
          formula: 'p = mv',
          description: 'Linear momentum'
        },
        {
          name: 'Impulse',
          formula: 'J = F\\Delta t = \\Delta p',
          description: 'Impulse-momentum theorem'
        },
        {
          name: 'Friction Force',
          formula: 'f = \\mu N',
          description: 'Friction force (static or kinetic)'
        }
      ]
    },
    {
      id: 'work-energy',
      title: 'Work, Energy & Power',
      formulas: [
        {
          name: 'Work Done',
          formula: 'W = F \\cdot s \\cos\\theta',
          description: 'Work done by constant force'
        },
        {
          name: 'Kinetic Energy',
          formula: 'K.E. = \\frac{1}{2}mv^2',
          description: 'Kinetic energy of moving body'
        },
        {
          name: 'Potential Energy',
          formula: 'U = mgh',
          description: 'Gravitational potential energy'
        },
        {
          name: 'Power',
          formula: 'P = \\frac{W}{t} = F \\cdot v',
          description: 'Rate of doing work'
        }
      ]
    }
  ],
  thermodynamics: [
    {
      id: 'laws',
      title: 'Laws of Thermodynamics',
      formulas: [
        {
          name: 'First Law',
          formula: 'dU = dQ - dW',
          description: 'Conservation of energy'
        },
        {
          name: 'Ideal Gas Equation',
          formula: 'PV = nRT',
          description: 'Equation of state for ideal gas'
        },
        {
          name: 'Specific Heat Relation',
          formula: 'C_p - C_v = R',
          description: "Mayer's relation"
        },
        {
          name: 'Adiabatic Process',
          formula: 'PV^\\gamma = \\text{constant}',
          description: 'For adiabatic process'
        },
        {
          name: 'Efficiency',
          formula: '\\eta = 1 - \\frac{T_2}{T_1}',
          description: 'Carnot engine efficiency'
        }
      ]
    }
  ],
  electricity: [
    {
      id: 'electrostatics',
      title: 'Electrostatics',
      formulas: [
        {
          name: "Coulomb's Law",
          formula: 'F = k\\frac{q_1q_2}{r^2}',
          description: 'Force between two charges'
        },
        {
          name: 'Electric Field',
          formula: 'E = \\frac{F}{q} = k\\frac{Q}{r^2}',
          description: 'Electric field due to point charge'
        },
        {
          name: 'Electric Potential',
          formula: 'V = k\\frac{Q}{r}',
          description: 'Potential due to point charge'
        },
        {
          name: 'Capacitance',
          formula: 'C = \\frac{Q}{V}',
          description: 'Capacity to store charge'
        }
      ]
    },
    {
      id: 'current',
      title: 'Current Electricity',
      formulas: [
        {
          name: "Ohm's Law",
          formula: 'V = IR',
          description: 'Voltage-current relation'
        },
        {
          name: 'Power',
          formula: 'P = VI = I^2R = \\frac{V^2}{R}',
          description: 'Electrical power dissipation'
        },
        {
          name: 'Series Resistance',
          formula: 'R_{eq} = R_1 + R_2 + R_3 + ...',
          description: 'Total resistance in series'
        },
        {
          name: 'Parallel Resistance',
          formula: '\\frac{1}{R_{eq}} = \\frac{1}{R_1} + \\frac{1}{R_2} + ...',
          description: 'Total resistance in parallel'
        }
      ]
    }
  ],
  optics: [
    {
      id: 'ray-optics',
      title: 'Ray Optics',
      formulas: [
        {
          name: 'Mirror Formula',
          formula: '\\frac{1}{f} = \\frac{1}{v} + \\frac{1}{u}',
          description: 'Relation between focal length and object/image distance'
        },
        {
          name: 'Lens Formula',
          formula: '\\frac{1}{f} = \\frac{1}{v} - \\frac{1}{u}',
          description: 'For thin lenses'
        },
        {
          name: 'Magnification',
          formula: 'm = \\frac{v}{u} = \\frac{h_i}{h_o}',
          description: 'Linear magnification'
        },
        {
          name: "Snell's Law",
          formula: 'n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2',
          description: 'Law of refraction'
        }
      ]
    }
  ],
  'modern-physics': [
    {
      id: 'quantum',
      title: 'Quantum Physics',
      formulas: [
        {
          name: 'Photoelectric Effect',
          formula: 'E = h\\nu = \\phi + K.E_{max}',
          description: "Einstein's photoelectric equation"
        },
        {
          name: 'de Broglie Wavelength',
          formula: '\\lambda = \\frac{h}{p} = \\frac{h}{mv}',
          description: 'Matter wave wavelength'
        },
        {
          name: 'Bohr Radius',
          formula: 'r_n = \\frac{n^2h^2}{4\\pi^2me^2}',
          description: 'Radius of nth orbit'
        },
        {
          name: 'Energy Levels',
          formula: 'E_n = -\\frac{13.6}{n^2} \\text{ eV}',
          description: 'Energy of hydrogen atom'
        }
      ]
    }
  ],
  waves: [
    {
      id: 'wave-motion',
      title: 'Wave Motion',
      formulas: [
        {
          name: 'Wave Equation',
          formula: 'y = A \\sin(\\omega t - kx)',
          description: 'Progressive wave equation'
        },
        {
          name: 'Wave Velocity',
          formula: 'v = f\\lambda = \\frac{\\omega}{k}',
          description: 'Relation between frequency and wavelength'
        },
        {
          name: 'Standing Wave',
          formula: 'y = 2A \\cos(kx) \\sin(\\omega t)',
          description: 'Stationary wave equation'
        },
        {
          name: 'Doppler Effect',
          formula: "f' = f\\frac{v \\pm v_o}{v \\mp v_s}",
          description: 'Apparent frequency due to motion'
        }
      ]
    }
  ]
}

export default function FormulasPage() {
  const [selectedTopic, setSelectedTopic] = useState<string>('mechanics')
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  const topics = [
    { id: 'mechanics', name: 'Mechanics', icon: '⚙️' },
    { id: 'thermodynamics', name: 'Thermodynamics', icon: '🔥' },
    { id: 'electricity', name: 'Electricity & Magnetism', icon: '⚡' },
    { id: 'optics', name: 'Optics', icon: '💡' },
    { id: 'modern-physics', name: 'Modern Physics', icon: '⚛️' },
    { id: 'waves', name: 'Waves & Oscillations', icon: '〰️' }
  ]

  const currentFormulas = formulaSheets[selectedTopic] || []
  
  // Filter formulas based on search
  const filteredFormulas = currentFormulas.map(section => ({
    ...section,
    formulas: section.formulas.filter(f => 
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.formulas.length > 0)

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="bg-[var(--background-elevated)] border-b border-[var(--border-color)]">
        <div className="container-airbnb py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 rounded-lg hover:bg-[var(--background-secondary)] transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-[var(--color-primary)]" />
                  Formula Sheets
                </h1>
                <p className="text-sm text-[var(--foreground-secondary)] mt-1">
                  Quick reference for JEE Physics formulas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-airbnb py-6 sm:py-8">
        {/* Topic Selector */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 sm:gap-3 min-w-max pb-2">
            {topics.map(topic => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  selectedTopic === topic.id
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--background-elevated)] hover:bg-[var(--background-hover)]'
                }`}
              >
                <span className="mr-2">{topic.icon}</span>
                {topic.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--foreground-secondary)]" />
            <input
              type="text"
              placeholder="Search formulas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--background-elevated)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
        </div>

        {/* Formula Sections */}
        <div className="space-y-6">
          {filteredFormulas.length > 0 ? (
            filteredFormulas.map(section => (
              <div key={section.id} className="bg-[var(--background-elevated)] rounded-[var(--radius-lg)] p-6 border border-[var(--border-color)]">
                <h2 className="text-lg sm:text-xl font-bold mb-4 text-[var(--foreground)]">
                  {section.title}
                </h2>
                <div className="grid gap-4">
                  {section.formulas.map((formula, index) => (
                    <div key={index} className="p-4 bg-[var(--background)] rounded-lg border border-[var(--border-color-light)]">
                      <h3 className="font-semibold mb-2 text-[var(--foreground)]">
                        {formula.name}
                      </h3>
                      <div className="mb-2 text-xl sm:text-2xl text-center py-3">
                        <BlockMath math={formula.formula} />
                      </div>
                      {formula.description && (
                        <p className="text-sm text-[var(--foreground-secondary)]">
                          {formula.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-[var(--foreground-secondary)] mx-auto mb-3" />
              <p className="text-[var(--foreground-secondary)]">
                {searchTerm ? 'No formulas found matching your search.' : 'No formulas available for this topic.'}
              </p>
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="mt-8 p-6 bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 rounded-[var(--radius-lg)] border border-[var(--color-primary)]/20">
          <h3 className="text-lg font-semibold mb-3">💡 Quick Tips</h3>
          <ul className="space-y-2 text-sm text-[var(--foreground-secondary)]">
            <li>• Click on any topic above to view its formulas</li>
            <li>• Use the search bar to quickly find specific formulas</li>
            <li>• All formulas support LaTeX rendering for mathematical expressions</li>
            <li>• Bookmark this page for quick access during practice</li>
          </ul>
        </div>
      </div>
    </div>
  )
}