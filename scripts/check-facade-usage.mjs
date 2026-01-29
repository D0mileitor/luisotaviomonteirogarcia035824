#!/usr/bin/env node
/**
 * Script para verificar se componentes estão usando facades ao invés de APIs diretamente
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const COMPONENTS_DIR = join(__dirname, '..', 'src', 'components')
const ALLOWED_IMPORTS = ['@/api/pets', '@/api/tutores'] 

let hasViolations = false

function checkFile(filePath) {
  const content = readFileSync(filePath, 'utf-8')
  const relativePath = relative(join(__dirname, '..'), filePath)
  
  
  if (filePath.includes('.test.')) {
    return
  }
  
  const violations = []
  
  ALLOWED_IMPORTS.forEach(apiImport => {
    
    const regex = new RegExp(`import\\s+(?!type\\s+).*from\\s+["']${apiImport}["']`, 'g')
    if (regex.test(content)) {
      violations.push(apiImport)
    }
  })
  
  if (violations.length > 0) {
    hasViolations = true
    console.error(`❌ ${relativePath}`)
    violations.forEach(v => {
      const facadeName = v.replace('@/api/', '') + 'Facade'
      console.error(`   - Importando ${v} diretamente. Use @/services/${facadeName} ao invés.`)
    })
  }
}

function walkDir(dir) {
  const files = readdirSync(dir)
  
  files.forEach(file => {
    const filePath = join(dir, file)
    const stat = statSync(filePath)
    
    if (stat.isDirectory()) {
      walkDir(filePath)
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      checkFile(filePath)
    }
  })
}

console.log('🔍 Verificando uso de facades...\n')

walkDir(COMPONENTS_DIR)

if (hasViolations) {
  console.error('\n Encontradas violações! Use facades ao invés de APIs diretamente.')
  process.exit(1)
} else {
  console.log('Todos os componentes estão usando facades corretamente!')
  process.exit(0)
}
