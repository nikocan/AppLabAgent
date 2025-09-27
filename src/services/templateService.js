// App Lab Agent - Template Service
// Proje şablonları ve kod template yönetimi servisi

const EventEmitter = require('events');
const path = require('path');

class TemplateService extends EventEmitter {
  constructor() {
    super();
    this.templates = new Map();
    this.categories = new Map();
    this.userTemplates = new Map();
    this.initializeDefaultTemplates();
  }

  // Varsayılan şablonları yükle
  initializeDefaultTemplates() {
    const defaultTemplates = [
      {
        id: 'react-web-app',
        name: 'React Web App',
        description: 'Modern React web uygulaması şablonu',
        category: 'web',
        type: 'frontend',
        platform: 'web',
        framework: 'react',
        language: 'javascript',
        version: '1.0.0',
        tags: ['react', 'javascript', 'web', 'frontend'],
        author: 'AppLab Team',
        isOfficial: true,
        structure: this.getReactWebAppStructure(),
        dependencies: {
          'react': '^18.0.0',
          'react-dom': '^18.0.0',
          'react-router-dom': '^6.0.0',
          'axios': '^1.0.0'
        },
        devDependencies: {
          '@vitejs/plugin-react': '^4.0.0',
          'vite': '^5.0.0',
          'eslint': '^8.0.0'
        }
      },
      {
        id: 'vue-web-app',
        name: 'Vue.js Web App',
        description: 'Modern Vue.js web uygulaması şablonu',
        category: 'web',
        type: 'frontend',
        platform: 'web',
        framework: 'vue',
        language: 'javascript',
        version: '1.0.0',
        tags: ['vue', 'javascript', 'web', 'frontend'],
        author: 'AppLab Team',
        isOfficial: true,
        structure: this.getVueWebAppStructure(),
        dependencies: {
          'vue': '^3.0.0',
          'vue-router': '^4.0.0',
          'pinia': '^2.0.0',
          'axios': '^1.0.0'
        }
      },
      {
        id: 'node-api',
        name: 'Node.js REST API',
        description: 'Express.js ile REST API şablonu',
        category: 'backend',
        type: 'backend',
        platform: 'server',
        framework: 'express',
        language: 'javascript',
        version: '1.0.0',
        tags: ['nodejs', 'express', 'api', 'backend'],
        author: 'AppLab Team',
        isOfficial: true,
        structure: this.getNodeApiStructure(),
        dependencies: {
          'express': '^4.18.0',
          'cors': '^2.8.5',
          'helmet': '^7.0.0',
          'mongoose': '^7.0.0'
        }
      },
      {
        id: 'react-native-app',
        name: 'React Native Mobile App',
        description: 'React Native mobil uygulama şablonu',
        category: 'mobile',
        type: 'mobile',
        platform: 'mobile',
        framework: 'react-native',
        language: 'javascript',
        version: '1.0.0',
        tags: ['react-native', 'mobile', 'ios', 'android'],
        author: 'AppLab Team',
        isOfficial: true,
        structure: this.getReactNativeStructure()
      },
      {
        id: 'flutter-app',
        name: 'Flutter Mobile App',
        description: 'Flutter mobil uygulama şablonu',
        category: 'mobile',
        type: 'mobile',
        platform: 'mobile',
        framework: 'flutter',
        language: 'dart',
        version: '1.0.0',
        tags: ['flutter', 'dart', 'mobile', 'ios', 'android'],
        author: 'AppLab Team',
        isOfficial: true,
        structure: this.getFlutterStructure()
      },
      {
        id: 'nextjs-fullstack',
        name: 'Next.js Fullstack App',
        description: 'Next.js ile fullstack web uygulaması',
        category: 'fullstack',
        type: 'fullstack',
        platform: 'web',
        framework: 'nextjs',
        language: 'typescript',
        version: '1.0.0',
        tags: ['nextjs', 'react', 'typescript', 'fullstack'],
        author: 'AppLab Team',
        isOfficial: true,
        structure: this.getNextjsStructure()
      }
    ];

    defaultTemplates.forEach(template => {
      template.createdAt = new Date().toISOString();
      template.updatedAt = new Date().toISOString();
      template.downloads = Math.floor(Math.random() * 1000) + 100;
      template.rating = 4 + Math.random();
      this.templates.set(template.id, template);
    });

    // Kategorileri tanımla
    this.categories.set('web', {
      name: 'Web Applications',
      description: 'Web uygulaması şablonları',
      icon: '🌐'
    });
    this.categories.set('mobile', {
      name: 'Mobile Applications',
      description: 'Mobil uygulama şablonları',
      icon: '📱'
    });
    this.categories.set('backend', {
      name: 'Backend Services',
      description: 'Backend ve API şablonları',
      icon: '⚙️'
    });
    this.categories.set('fullstack', {
      name: 'Fullstack Applications',
      description: 'Fullstack uygulama şablonları',
      icon: '🔧'
    });
  }

  // Şablon yapıları
  getReactWebAppStructure() {
    return {
      'package.json': {
        type: 'file',
        content: JSON.stringify({
          name: '{{projectName}}',
          version: '0.1.0',
          private: true,
          dependencies: {
            react: '^18.0.0',
            'react-dom': '^18.0.0',
            'react-router-dom': '^6.0.0'
          },
          scripts: {
            start: 'react-scripts start',
            build: 'react-scripts build',
            test: 'react-scripts test'
          }
        }, null, 2)
      },
      'src': {
        type: 'directory',
        children: {
          'App.js': {
            type: 'file',
            content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>{{projectName}}</h1>
        <p>React uygulamanız hazır!</p>
      </header>
    </div>
  );
}

export default App;`
          },
          'App.css': {
            type: 'file',
            content: `.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}`
          },
          'index.js': {
            type: 'file',
            content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`
          }
        }
      },
      'public': {
        type: 'directory',
        children: {
          'index.html': {
            type: 'file',
            content: `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{{projectName}}</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`
          }
        }
      }
    };
  }

  getVueWebAppStructure() {
    return {
      'package.json': {
        type: 'file',
        content: JSON.stringify({
          name: '{{projectName}}',
          version: '0.1.0',
          scripts: {
            dev: 'vite',
            build: 'vite build',
            preview: 'vite preview'
          },
          dependencies: {
            vue: '^3.0.0'
          }
        }, null, 2)
      },
      'src': {
        type: 'directory',
        children: {
          'App.vue': {
            type: 'file',
            content: `<template>
  <div id="app">
    <header>
      <h1>{{ title }}</h1>
      <p>Vue.js uygulamanız hazır!</p>
    </header>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      title: '{{projectName}}'
    }
  }
}
</script>

<style>
#app {
  text-align: center;
  margin-top: 60px;
}
</style>`
          },
          'main.js': {
            type: 'file',
            content: `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`
          }
        }
      },
      'index.html': {
        type: 'file',
        content: `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{projectName}}</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>`
      }
    };
  }

  getNodeApiStructure() {
    return {
      'package.json': {
        type: 'file',
        content: JSON.stringify({
          name: '{{projectName}}',
          version: '1.0.0',
          description: 'Node.js REST API',
          main: 'server.js',
          scripts: {
            start: 'node server.js',
            dev: 'nodemon server.js'
          },
          dependencies: {
            express: '^4.18.0',
            cors: '^2.8.5',
            helmet: '^7.0.0'
          }
        }, null, 2)
      },
      'server.js': {
        type: 'file',
        content: `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: '{{projectName}} API çalışıyor!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(\`Server \${PORT} portunda çalışıyor\`);
});`
      },
      'routes': {
        type: 'directory',
        children: {
          'index.js': {
            type: 'file',
            content: `const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'API Routes' });
});

module.exports = router;`
          }
        }
      },
      '.env.example': {
        type: 'file',
        content: `PORT=3000
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/{{projectName}}`
      }
    };
  }

  getReactNativeStructure() {
    return {
      'package.json': {
        type: 'file',
        content: JSON.stringify({
          name: '{{projectName}}',
          version: '0.0.1',
          private: true,
          scripts: {
            android: 'react-native run-android',
            ios: 'react-native run-ios',
            start: 'react-native start'
          },
          dependencies: {
            'react': '^18.0.0',
            'react-native': '^0.72.0'
          }
        }, null, 2)
      },
      'App.js': {
        type: 'file',
        content: `import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const App = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{{projectName}}</Text>
      <Text style={styles.subtitle}>React Native uygulamanız hazır!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

export default App;`
      }
    };
  }

  getFlutterStructure() {
    return {
      'pubspec.yaml': {
        type: 'file',
        content: `name: {{projectNameSnakeCase}}
description: Flutter uygulaması

version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.2

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^2.0.0

flutter:
  uses-material-design: true`
      },
      'lib': {
        type: 'directory',
        children: {
          'main.dart': {
            type: 'file',
            content: `import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '{{projectName}}',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const MyHomePage(title: '{{projectName}}'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
      ),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text(
              'Flutter uygulamanız hazır!',
              style: TextStyle(fontSize: 24),
            ),
          ],
        ),
      ),
    );
  }
}`
          }
        }
      }
    };
  }

  getNextjsStructure() {
    return {
      'package.json': {
        type: 'file',
        content: JSON.stringify({
          name: '{{projectName}}',
          version: '0.1.0',
          private: true,
          scripts: {
            dev: 'next dev',
            build: 'next build',
            start: 'next start',
            lint: 'next lint'
          },
          dependencies: {
            'next': '^14.0.0',
            'react': '^18.0.0',
            'react-dom': '^18.0.0'
          }
        }, null, 2)
      },
      'app': {
        type: 'directory',
        children: {
          'layout.tsx': {
            type: 'file',
            content: `export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}`
          },
          'page.tsx': {
            type: 'file',
            content: `export default function Home() {
  return (
    <main>
      <h1>{{projectName}}</h1>
      <p>Next.js uygulamanız hazır!</p>
    </main>
  )
}`
          }
        }
      }
    };
  }

  // Şablonları listele
  getTemplates(filters = {}) {
    let templates = Array.from(this.templates.values());

    // Filtrele
    if (filters.category) {
      templates = templates.filter(t => t.category === filters.category);
    }
    if (filters.framework) {
      templates = templates.filter(t => t.framework === filters.framework);
    }
    if (filters.language) {
      templates = templates.filter(t => t.language === filters.language);
    }
    if (filters.platform) {
      templates = templates.filter(t => t.platform === filters.platform);
    }
    if (filters.tags && filters.tags.length > 0) {
      templates = templates.filter(t => 
        filters.tags.some(tag => t.tags.includes(tag))
      );
    }

    // Sırala
    const sortBy = filters.sortBy || 'downloads';
    templates.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'rating':
          return b.rating - a.rating;
        case 'downloads':
        default:
          return b.downloads - a.downloads;
      }
    });

    return templates.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      framework: template.framework,
      language: template.language,
      platform: template.platform,
      tags: template.tags,
      author: template.author,
      isOfficial: template.isOfficial,
      version: template.version,
      downloads: template.downloads,
      rating: template.rating,
      createdAt: template.createdAt
    }));
  }

  // Şablon detaylarını getir
  getTemplate(templateId) {
    const template = this.templates.get(templateId);
    if (!template) {
      return { success: false, error: 'Şablon bulunamadı' };
    }

    return { success: true, template };
  }

  // Şablondan proje oluştur
  async createProjectFromTemplate(templateId, projectData) {
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        return { success: false, error: 'Şablon bulunamadı' };
      }

      // Download sayısını artır
      template.downloads++;

      const projectStructure = this.processTemplateVariables(
        template.structure,
        projectData
      );

      this.emit('template_used', {
        templateId,
        projectName: projectData.projectName,
        userId: projectData.userId
      });

      return {
        success: true,
        project: {
          name: projectData.projectName,
          template: template.name,
          framework: template.framework,
          language: template.language,
          structure: projectStructure,
          dependencies: template.dependencies,
          devDependencies: template.devDependencies
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Template değişkenlerini işle
  processTemplateVariables(structure, variables) {
    const processedStructure = {};

    for (const [key, value] of Object.entries(structure)) {
      let processedKey = key;
      
      // Key'deki değişkenleri değiştir
      Object.entries(variables).forEach(([varName, varValue]) => {
        const regex = new RegExp(`{{${varName}}}`, 'g');
        processedKey = processedKey.replace(regex, varValue);
      });

      if (value.type === 'file') {
        // Dosya içeriğindeki değişkenleri değiştir
        let content = value.content;
        Object.entries(variables).forEach(([varName, varValue]) => {
          const regex = new RegExp(`{{${varName}}}`, 'g');
          content = content.replace(regex, varValue);
          
          // Özel değişkenler
          if (varName === 'projectName') {
            const snakeCase = varValue.toLowerCase().replace(/\s+/g, '_');
            content = content.replace(/{{projectNameSnakeCase}}/g, snakeCase);
          }
        });

        processedStructure[processedKey] = {
          type: 'file',
          content
        };
      } else if (value.type === 'directory') {
        processedStructure[processedKey] = {
          type: 'directory',
          children: this.processTemplateVariables(value.children, variables)
        };
      }
    }

    return processedStructure;
  }

  // Kullanıcı şablonu oluştur
  createUserTemplate(templateData, userId) {
    try {
      const templateId = this.generateTemplateId();
      const template = {
        id: templateId,
        name: templateData.name,
        description: templateData.description,
        category: templateData.category,
        type: templateData.type,
        platform: templateData.platform,
        framework: templateData.framework,
        language: templateData.language,
        version: templateData.version || '1.0.0',
        tags: templateData.tags || [],
        author: userId,
        isOfficial: false,
        structure: templateData.structure,
        dependencies: templateData.dependencies || {},
        devDependencies: templateData.devDependencies || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        downloads: 0,
        rating: 0,
        isPublic: templateData.isPublic || false
      };

      this.templates.set(templateId, template);
      
      // Kullanıcı şablonları listesine ekle
      if (!this.userTemplates.has(userId)) {
        this.userTemplates.set(userId, []);
      }
      this.userTemplates.get(userId).push(templateId);

      this.emit('user_template_created', template);

      return {
        success: true,
        template: {
          id: template.id,
          name: template.name,
          description: template.description,
          category: template.category,
          createdAt: template.createdAt
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Kullanıcının şablonlarını getir
  getUserTemplates(userId) {
    const userTemplateIds = this.userTemplates.get(userId) || [];
    const templates = userTemplateIds.map(id => this.templates.get(id))
      .filter(Boolean)
      .map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        framework: template.framework,
        language: template.language,
        downloads: template.downloads,
        rating: template.rating,
        isPublic: template.isPublic,
        createdAt: template.createdAt
      }));

    return { success: true, templates };
  }

  // Şablon güncelle
  updateTemplate(templateId, updates, userId) {
    const template = this.templates.get(templateId);
    if (!template) {
      return { success: false, error: 'Şablon bulunamadı' };
    }

    // Sadece şablon sahibi güncelleyebilir
    if (template.author !== userId && !template.isOfficial) {
      return { success: false, error: 'Bu şablonu güncelleme yetkiniz yok' };
    }

    // Güncellemeyi uygula
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'author' && key !== 'createdAt') {
        template[key] = updates[key];
      }
    });

    template.updatedAt = new Date().toISOString();

    this.emit('template_updated', template);
    return { success: true, template };
  }

  // Şablon sil
  deleteTemplate(templateId, userId) {
    const template = this.templates.get(templateId);
    if (!template) {
      return { success: false, error: 'Şablon bulunamadı' };
    }

    // Sadece şablon sahibi silebilir
    if (template.author !== userId) {
      return { success: false, error: 'Bu şablonu silme yetkiniz yok' };
    }

    // Official şablonları silinemez
    if (template.isOfficial) {
      return { success: false, error: 'Resmi şablonlar silinemez' };
    }

    this.templates.delete(templateId);

    // Kullanıcı listesinden de kaldır
    const userTemplateIds = this.userTemplates.get(userId) || [];
    const filteredIds = userTemplateIds.filter(id => id !== templateId);
    this.userTemplates.set(userId, filteredIds);

    this.emit('template_deleted', template);
    return { success: true };
  }

  // Kategorileri getir
  getCategories() {
    return Array.from(this.categories.entries()).map(([id, category]) => ({
      id,
      ...category
    }));
  }

  // Popüler şablonları getir
  getPopularTemplates(limit = 10) {
    const templates = Array.from(this.templates.values())
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, limit)
      .map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        framework: template.framework,
        downloads: template.downloads,
        rating: template.rating,
        isOfficial: template.isOfficial
      }));

    return { success: true, templates };
  }

  // Şablon arama
  searchTemplates(query, filters = {}) {
    let templates = Array.from(this.templates.values());

    // Anahtar kelime araması
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      templates = templates.filter(template =>
        template.name.toLowerCase().includes(lowercaseQuery) ||
        template.description.toLowerCase().includes(lowercaseQuery) ||
        template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
        template.framework.toLowerCase().includes(lowercaseQuery)
      );
    }

    // Filtreleri uygula
    return this.getTemplates({ ...filters, templates });
  }

  // Template istatistikleri
  getTemplateStats() {
    const templates = Array.from(this.templates.values());
    
    return {
      totalTemplates: templates.length,
      officialTemplates: templates.filter(t => t.isOfficial).length,
      userTemplates: templates.filter(t => !t.isOfficial).length,
      byCategory: templates.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + 1;
        return acc;
      }, {}),
      byFramework: templates.reduce((acc, t) => {
        acc[t.framework] = (acc[t.framework] || 0) + 1;
        return acc;
      }, {}),
      byLanguage: templates.reduce((acc, t) => {
        acc[t.language] = (acc[t.language] || 0) + 1;
        return acc;
      }, {}),
      totalDownloads: templates.reduce((acc, t) => acc + t.downloads, 0),
      averageRating: templates.length ? 
        templates.reduce((acc, t) => acc + t.rating, 0) / templates.length : 0
    };
  }

  // ID generator
  generateTemplateId() {
    return `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = new TemplateService();