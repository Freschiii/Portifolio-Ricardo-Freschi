import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Camera, Mail, Phone, Instagram, Sun, Moon, ChevronLeft, ChevronRight, Aperture, Palette, Video, Image, Music, Mic, Headphones, Zap, Copy, Check, PhoneCall, User, CameraIcon } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import './App.css'

// Import da imagem hero
import heroImage from './assets/IMG_9998.jpg'

// Função para importar dinamicamente todas as imagens da pasta assets
function importAllImages() {
  const images = {}
  
  // Importa todas as imagens JPG da pasta assets
  const imageModules = import.meta.glob('./assets/*.jpg', { eager: true })
  
  Object.keys(imageModules).forEach((path) => {
    const imageName = path.replace('./assets/', '').replace('.jpg', '')
    images[imageName] = imageModules[path].default
  })
  
  return images
}

// Função para importar imagens de fundo
function importBackgroundImages() {
  const backgrounds = []
  const backgroundModules = import.meta.glob('./assets/backgrounds/*.{jpg,jpeg,png}', { eager: true })
  Object.keys(backgroundModules).forEach((path) => {
    backgrounds.push(backgroundModules[path].default)
  })
  return backgrounds
}

// Função para importar fotos da biografia
function importBiographyImages() {
  const biographyImages = []
  const biographyModules = import.meta.glob('./assets/biography/*.{jpg,jpeg,png}', { eager: true })
  Object.keys(biographyModules).forEach((path) => {
    biographyImages.push(biographyModules[path].default)
  })
  return biographyImages
}

// Carrega arquivos .txt de projetos e transforma em objetos de projeto
function parseProjectTxt(rawText, filePath) {
  // Parse simples baseado em linhas chave: valor
  const lines = rawText.split(/\r?\n/)
  const data = { title: '', description: '', youtube: '', videoFile: '', role: '', year: '', id: filePath }
  let collectingDescription = false
  let descriptionBuffer = []

  for (const line of lines) {
    const match = line.match(/^\s*([A-Za-zÀ-ÿ_ ]+)\s*:\s*(.*)$/)
    if (match) {
      const key = match[1].trim().toLowerCase()
      const value = match[2].trim()
      collectingDescription = false
      if (key === 'título' || key === 'titulo' || key === 'title') data.title = value
      else if (key === 'descrição' || key === 'descricao' || key === 'description') {
        collectingDescription = true
        descriptionBuffer = value ? [value] : []
      } else if (key === 'youtube' || key === 'link' || key === 'url') data.youtube = value
      else if (key === 'videofile' || key === 'arquivo' || key === 'arquivo de vídeo' || key === 'arquivo de video') data.videoFile = value
      else if (key === 'função' || key === 'funcao' || key === 'role') data.role = value
      else if (key === 'ano' || key === 'year') data.year = value
    } else if (collectingDescription) {
      descriptionBuffer.push(line)
    }
  }
  if (descriptionBuffer.length) data.description = descriptionBuffer.join('\n').trim()
  return data
}

function importProjectTexts() {
  // Lê todos .txt em assets/projects
  const projectTxtModules = import.meta.glob('./assets/projects/**/*.txt', { eager: true, as: 'raw' })
  const projects = []
  Object.entries(projectTxtModules).forEach(([path, raw]) => {
    try {
      const parsed = parseProjectTxt(raw, path)
      // Valores padrão e normalização
      projects.push({
        id: parsed.id,
        title: parsed.title || 'Projeto sem título',
        description: parsed.description || '',
        videoUrl: parsed.youtube || '',
        videoFile: parsed.videoFile || '',
        role: parsed.role || '',
        year: parsed.year || ''
      })
    } catch (e) {
      // Em caso de erro de parsing, ignora arquivo
    }
  })
  return projects
}

// Função para categorizar imagens baseado no nome
function categorizeImage(imageName) {
  // Imagens que começam com IMG_ são geralmente retratos
  if (imageName.startsWith('IMG_')) {
    return 'retratos'
  }
  
  // Imagens que começam com RIK- são categorizadas por número
  if (imageName.startsWith('RIK-')) {
    const number = parseInt(imageName.split('-')[1])
    
    // Eventos: números específicos
    if ([4487, 4501, 4504, 4508, 6640, 6663, 6672, 6682, 6715].includes(number)) {
      return 'eventos'
    }
    
    // Grupos: números específicos
    if ([4512, 4513, 4515].includes(number)) {
      return 'grupos'
    }
    
    // Paisagens: números específicos
    if ([3694, 6631, 6696].includes(number)) {
      return 'paisagens'
    }
    
    // Novas imagens (6452, 6478, 6479, 6744) - categorizar como retratos por padrão
    if ([6452, 6478, 6479, 6744].includes(number)) {
      return 'retratos'
    }
    
    // Demais imagens RIK- são retratos por padrão
    return 'retratos'
  }
  
  // Padrão: retratos
  return 'retratos'
}

// Função para gerar alt text baseado na categoria
function generateAltText(category, imageName) {
  const altTexts = {
    'retratos': 'Retrato profissional',
    'eventos': 'Fotografia de evento',
    'grupos': 'Fotografia de grupo',
    'paisagens': 'Fotografia de paisagem'
  }
  
  return altTexts[category] || 'Fotografia profissional'
}

// Gera a galeria dinamicamente
function generateGalleryImages() {
  const allImages = importAllImages()
  const galleryImages = []
  
  Object.keys(allImages).forEach((imageName) => {
    // Pula a imagem hero
    if (imageName === 'IMG_9998') return
    
    const category = categorizeImage(imageName)
    const altText = generateAltText(category, imageName)
    
    galleryImages.push({
      src: allImages[imageName],
      category: category,
      alt: altText,
      name: imageName
    })
  })
  
  // Ordena as imagens: primeiro por categoria, depois por nome
  return galleryImages.sort((a, b) => {
    if (a.category !== b.category) {
      const categoryOrder = ['retratos', 'eventos', 'grupos', 'paisagens']
      return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
    }
    return a.name.localeCompare(b.name)
  })
}

// Gera a galeria dinamicamente
const galleryImages = generateGalleryImages()

function Navigation({ currentPage, setCurrentPage, isDarkMode, toggleDarkMode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${
      isDarkMode 
        ? 'border-gray-700' 
        : 'bg-white/90 border-gray-200'
    }`} style={isDarkMode ? { backgroundColor: 'rgba(7, 9, 13, 0.9)' } : {}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 relative">
          {/* Left group: Outros projetos */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => setCurrentPage('projetos')}
              className={`capitalize font-medium transition-colors duration-200 ${
                currentPage === 'projetos'
                  ? `${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'} opacity-90`
                  : `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-800'} text-sm`
              }`}
            >
              outros projetos
            </button>
          </div>

          {/* Center icon */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
            <button
              onClick={() => setCurrentPage('home')}
              className="p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label="Ir para Home"
            >
              <Aperture className={`h-7 w-7 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} />
            </button>
          </div>

          {/* Right group: home/galeria/contato + dark toggle (desktop) */}
          <div className="hidden md:flex items-center space-x-8">
            {['home', 'galeria', 'contato', 'curriculo'].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`capitalize font-medium transition-colors duration-200 ${
                  currentPage === page 
                    ? `${isDarkMode ? 'text-white border-white' : 'text-gray-800 border-gray-800'} border-b-2` 
                    : `${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`
                }`}
              >
                {page}
              </button>
            ))}
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Controls */}
          {/* Left: Dark Mode Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
          
          {/* Right: Hamburger */}
          <div className="md:hidden flex items-center ml-auto">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? 
                <X className={`h-6 w-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} /> : 
                <Menu className={`h-6 w-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} />
              }
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`md:hidden absolute top-full left-0 right-0 z-50 mx-4 mt-2 rounded-xl shadow-2xl border backdrop-blur-lg ${
                isDarkMode 
                  ? 'border-gray-700 bg-gray-900/95' 
                  : 'border-gray-200 bg-white/95'
              }`}
            >
              <div className="py-2">
                {['home', 'galeria', 'contato', 'projetos', 'curriculo'].map((page, index) => (
                  <motion.button
                    key={page}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      setCurrentPage(page)
                      setIsMenuOpen(false)
                    }}
                    className={`w-full text-left px-6 py-4 mx-2 my-1 rounded-lg capitalize font-medium transition-all duration-200 ${
                      page === 'projetos'
                        ? (
                            currentPage === page
                              ? `${isDarkMode ? 'text-gray-200 bg-gray-800/60' : 'text-gray-700 bg-gray-100/70'} text-base`
                              : `${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800/40' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/60'} text-sm`
                          )
                        : (
                            currentPage === page 
                              ? `${isDarkMode 
                                  ? 'text-white bg-gray-700 shadow-lg' 
                                  : 'text-white bg-gray-800 shadow-lg'}` 
                              : `${isDarkMode 
                                  ? 'text-gray-300 hover:text-white hover:bg-gray-800/50' 
                                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/50'}`
                          )
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        currentPage === page 
                          ? 'bg-white' 
                          : isDarkMode ? 'bg-gray-500' : 'bg-gray-400'
                      }`} />
                      <span className={`${page === 'projetos' ? 'tracking-wide' : ''} ${currentPage === page && page === 'projetos' ? 'opacity-90' : ''}`}>
                        {page === 'projetos' ? 'outros projetos' : page}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

function HomePage({ setCurrentPage, isDarkMode, onImageClick, backgroundImages, currentBackgroundIndex }) {
  // Função para embaralhar array e pegar 3 imagens aleatórias
  const getRandomImages = () => {
    const shuffled = [...galleryImages].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 3)
  }

  const [randomImages] = useState(() => getRandomImages())

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? '' : 'bg-white'}`} style={isDarkMode ? { backgroundColor: '#0F1217' } : {}}>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {backgroundImages.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentBackgroundIndex}
                src={backgroundImages[currentBackgroundIndex]} 
                alt="Ricardo Freschi Photography" 
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </AnimatePresence>
          ) : (
          <img 
            src={heroImage} 
            alt="Ricardo Freschi Photography" 
            className="w-full h-full object-cover"
          />
          )}
          <div className="absolute inset-0 bg-black/40"></div>
          
        </div>
        
        <motion.div 
          className="absolute left-1/2 transform -translate-x-1/2 z-10 text-center text-white px-4 hero-text-position"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-4">
            Ricardo Freschi
          </h1>
          <p className="text-xl md:text-2xl font-light mb-8">
            Fotógrafo Profissional
          </p>

        </motion.div>
      </section>

      {/* Gallery Preview Section */}
      <section className={`py-20 px-4 transition-colors duration-300 ${isDarkMode ? '' : 'bg-gray-100'}`} style={isDarkMode ? { backgroundColor: '#141821' } : {}}>
        <div className="max-w-7xl mx-auto text-center">
          <h2 className={`font-serif text-4xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Meus Trabalhos
          </h2>
          <p className={`text-lg max-w-2xl mx-auto mb-12 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Confira uma amostra do meu portfólio. Clique nas imagens para ver mais.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {randomImages.map((image, index) => (
              <div
                key={index}
                className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg"
                onClick={() => onImageClick(image)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  style={{ 
                    imageRendering: 'high-quality',
                    imageRendering: '-webkit-optimize-contrast'
                  }}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            className={`mt-12 py-3 px-8 rounded-lg text-lg font-medium transition-all duration-200 ${
              isDarkMode 
                ? 'bg-white hover:bg-gray-200 text-gray-900' 
                : 'bg-gray-800 hover:bg-gray-700 text-white'
            }`}
            onClick={() => setCurrentPage("galeria")}
          >
            Ver Galeria Completa
          </button>
        </div>
      </section>

      {/* About Section */}
      <section className={`py-20 px-4 transition-colors duration-300 ${isDarkMode ? '' : 'bg-gray-50'}`} style={isDarkMode ? { backgroundColor: '#0F1217' } : {}}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className={`font-serif text-4xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Capturando Momentos Únicos
            </h2>
            <p className={`text-lg leading-relaxed mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Especializado em retratos profissionais, fotografia de eventos e paisagens. 
              Transformo momentos especiais em memórias eternas 
              através da arte da fotografia.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <h3 className={`font-semibold text-xl mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Retratos</h3>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Capturando a essência única de cada pessoa</p>
              </div>
              <div className="text-center">
                <h3 className={`font-semibold text-xl mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Eventos</h3>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Documentando seus momentos mais especiais</p>
              </div>
              <div className="text-center">
                <h3 className={`font-semibold text-xl mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Paisagens</h3>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Revelando a beleza do mundo natural</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

function GalleryPage({ isDarkMode, selectedImage }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedImageForLightbox, setSelectedImageForLightbox] = useState(null)
  const [slideDirection, setSlideDirection] = useState(0) // 0: initial, 1: right, -1: left
  const imagesPerPage = 12 // Número de imagens por página (aumentado de 9 para 12)

  // Calcula o índice inicial e final das imagens para a página atual
  const indexOfLastImage = currentPage * imagesPerPage
  const indexOfFirstImage = indexOfLastImage - imagesPerPage
  const currentImages = galleryImages.slice(indexOfFirstImage, indexOfLastImage)

  // Calcula o número total de páginas
  const totalPages = Math.ceil(galleryImages.length / imagesPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setSlideDirection(-1) // Slide para a esquerda
      setCurrentPage(currentPage - 1)
    }
  }
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setSlideDirection(1) // Slide para a direita
      setCurrentPage(currentPage + 1)
    }
  }

  // Se uma imagem foi selecionada na home, abre ela no lightbox
  useEffect(() => {
    if (selectedImage) {
      setSelectedImageForLightbox(selectedImage)
    }
  }, [selectedImage])

  // Reset da direção do slide após a animação
  useEffect(() => {
    if (slideDirection !== 0) {
      const timer = setTimeout(() => {
        setSlideDirection(0)
      }, 500) // Duração da animação ajustada
      return () => clearTimeout(timer)
    }
  }, [slideDirection])

  // Função para fechar o lightbox e limpar o estado
  const closeLightbox = () => {
    setSelectedImageForLightbox(null)
  }

  return (
    <div className={`min-h-screen pt-20 pb-12 transition-colors duration-300 ${isDarkMode ? '' : 'bg-white'}`} style={isDarkMode ? { backgroundColor: '#0F1217' } : {}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className={`font-serif text-4xl md:text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Galeria
          </h1>
          <p className={`text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Uma seleção dos meus trabalhos mais recentes e representativos
          </p>
        </motion.div>

        {/* Image Grid */}
        <div className="relative overflow-hidden">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            key={currentPage}
            style={{ willChange: 'transform, opacity' }}
            initial={{ 
              x: slideDirection === 1 ? 200 : slideDirection === -1 ? -200 : 0,
              opacity: 0 
            }}
            animate={{ 
              x: 0, 
              opacity: 1 
            }}
            transition={{ 
              duration: 0.5, 
              ease: [0.25, 0.46, 0.45, 0.94],
              type: "tween"
            }}
          >
            {currentImages.map((image, index) => (
              <motion.div
                key={`${currentPage}-${image.src}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.03,
                  ease: "easeOut" 
                }}
                className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg"
                onClick={() => setSelectedImageForLightbox(image)}
              >
                <img 
                  src={image.src} 
                  alt={image.alt}
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                  style={{ 
                    imageRendering: 'high-quality',
                    imageRendering: '-webkit-optimize-contrast'
                  }}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
        </motion.div>
        </div>

        {/* Pagination with Arrows */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 space-x-8">
            {/* Previous Arrow */}
              <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                currentPage === 1
                  ? (isDarkMode 
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed')
                  : (isDarkMode 
                      ? 'bg-gray-700 text-white hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            {/* Page Info */}
            <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Página {currentPage} de {totalPages}
            </div>

            {/* Next Arrow */}
              <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                currentPage === totalPages
                  ? (isDarkMode 
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed')
                  : (isDarkMode 
                      ? 'bg-gray-700 text-white hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
              }`}
            >
              <span className="hidden sm:inline">Próxima</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Lightbox */}
        <AnimatePresence>
          {selectedImageForLightbox && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
              onClick={closeLightbox}
            >
              <motion.img
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                src={selectedImageForLightbox.src}
                alt={selectedImageForLightbox.alt}
                className="max-w-[95vw] max-h-[95vh] w-auto h-auto object-contain"
                style={{ 
                  imageRendering: 'high-quality',
                  imageRendering: '-webkit-optimize-contrast'
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black/50 rounded-full p-2 transition-colors duration-200"
              >
                <X className="h-8 w-8" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function ProjectsPage({ isDarkMode }) {
  // Dados vindos dos .txt na pasta de projetos
  const projects = importProjectTexts()
  
  // Extrai o ID do YouTube (suporta youtu.be, youtube.com/watch?v=, e shorts)
  const getYouTubeId = (url) => {
    if (!url) return ''
    try {
      const u = new URL(url)
      if (u.hostname.includes('youtu.be')) return u.pathname.slice(1)
      if (u.searchParams.get('v')) return u.searchParams.get('v')
      const parts = u.pathname.split('/')
      const idx = parts.findIndex(p => p === 'shorts' || p === 'embed')
      if (idx >= 0 && parts[idx + 1]) return parts[idx + 1]
      return ''
    } catch {
      return ''
    }
  }

  const [activeVideo, setActiveVideo] = useState(null) // { title, ytId, url }

  // Cores exclusivas para a página Projetos (mais distintas)
  const themedBgStyle = isDarkMode 
    ? { backgroundColor: '#0A1022' } // navy escuro
    : { backgroundColor: '#EEF2FF' } // indigo-50
  const cardClasses = isDarkMode ? 'bg-[#0F172A] border border-white/5' : 'bg-white border border-indigo-100'
  const accentBtn = isDarkMode ? 'bg-indigo-500 hover:bg-indigo-400 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
  const neutralBtn = isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200'
  const headerText = isDarkMode ? 'text-white' : 'text-indigo-900'
  const subText = isDarkMode ? 'text-indigo-200' : 'text-indigo-700'

  return (
    <div className={`min-h-screen py-20 px-4 transition-colors duration-300`} style={themedBgStyle}>
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${headerText}`}>
            Outros projetos
          </h1>
          <p className={`text-lg ${subText}`}>
            Conheça alguns dos projetos em que participei
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => {
            const ytId = getYouTubeId(project.videoUrl)
            const hasYouTube = Boolean(ytId)
            const thumbnail = hasYouTube ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : ''

            return (
              <motion.div
                key={project.id || index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`rounded-2xl overflow-hidden shadow-xl ${cardClasses}`}
              >
                {/* Área do Vídeo / Thumbnail */}
                <div className="relative aspect-video bg-black">
                  <button
                    type="button"
                    onClick={() => {
                      if (hasYouTube) setActiveVideo({ title: project.title, ytId, url: project.videoUrl })
                      else if (project.videoFile) window.open(project.videoFile, '_blank')
                      else if (project.videoUrl) window.open(project.videoUrl, '_blank')
                    }}
                    className="absolute inset-0 w-full h-full group"
                  >
                    {/* Thumbnail do YouTube ou fallback */}
                    {hasYouTube ? (
                      <img
                        src={thumbnail}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-slate-700' : 'bg-indigo-200'}`}>
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 5v10l8-5-8-5z"/>
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Overlay + Play */}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${isDarkMode ? 'bg-black/50' : 'bg-black/40'}`}>
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 5v10l8-5-8-5z"/>
                        </svg>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Conteúdo do Projeto */}
                <div className="p-6">
                  <h3 className={`text-xl font-bold mb-2 ${headerText}`}>
                    {project.title}
                  </h3>

                  {project.role || project.year ? (
                    <div className="flex items-center gap-3 mb-3">
                      {project.role && (
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${isDarkMode ? 'bg-indigo-500/30 text-indigo-200' : 'bg-indigo-100 text-indigo-700'}`}>
                          {project.role}
                        </span>
                      )}
                      {project.year && (
                        <span className={`text-xs ${subText}`}>
                          {project.year}
                        </span>
                      )}
                    </div>
                  ) : null}

                  <p className={`text-sm leading-relaxed ${subText}`}>
                    {project.description}
                  </p>

                  {(project.videoUrl || project.videoFile) && (
                    <div className="mt-4 grid grid-cols-1 gap-2">
                      {hasYouTube && (
                        <button
                          type="button"
                          onClick={() => setActiveVideo({ title: project.title, ytId, url: project.videoUrl })}
                          className={`${accentBtn} rounded-lg py-2 px-3 text-sm font-medium transition-colors`}
                        >
                          Assistir na página
                        </button>
                      )}
                      <a
                        href={project.videoUrl || project.videoFile}
                        target="_blank"
                        rel="noreferrer"
                        className={`${neutralBtn} rounded-lg py-2 px-3 text-sm font-medium text-center transition-colors`}
                      >
                        Abrir no YouTube
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Modal Player */}
        <AnimatePresence>
          {activeVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
              onClick={() => setActiveVideo(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="w-full max-w-5xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative" style={{ paddingTop: '56.25%' }}>
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube-nocookie.com/embed/${activeVideo.ytId}?rel=0&modestbranding=1`}
                    title={activeVideo.title}
                    frameBorder="0"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                <button
                  onClick={() => setActiveVideo(null)}
                  className="absolute -top-10 right-0 text-white hover:text-gray-300 bg-black/50 rounded-full p-2 transition-colors duration-200"
                >
                  <X className="h-8 w-8" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function ContactPage({ isDarkMode, biographyImages, currentBiographyIndex }) {

  return (
    <div className={`min-h-screen pt-20 pb-12 transition-colors duration-300 ${isDarkMode ? '' : 'bg-white'}`} style={isDarkMode ? { backgroundColor: '#0F1217' } : {}}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className={`font-serif text-4xl md:text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Sobre Mim
          </h1>
          <p className={`text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Conheça um pouco da minha história e paixão pela fotografia
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Informações de Contato - Esquerda */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className={`font-serif text-2xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Entre em Contato
            </h2>
            
            <div className="space-y-6">
              <div className={`flex items-center space-x-4 p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} hover:shadow-lg transition-all duration-300`}>
                <div className={`p-3 rounded-full ${isDarkMode ? 'bg-blue-600/20' : 'bg-blue-100'}`}>
                  <Mail className={`h-6 w-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <div>
                  <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Email</h3>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>ricardodias2004@gmail.com</p>
                </div>
              </div>

              <div className={`flex items-center space-x-4 p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} hover:shadow-lg transition-all duration-300`}>
                <div className={`p-3 rounded-full ${isDarkMode ? 'bg-green-600/20' : 'bg-green-100'}`}>
                  <Phone className={`h-6 w-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <div>
                  <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Telefone</h3>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>(11) 95779-8732</p>
                </div>
              </div>

              <div className={`flex items-center space-x-4 p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} hover:shadow-lg transition-all duration-300`}>
                <div className={`p-3 rounded-full ${isDarkMode ? 'bg-pink-600/20' : 'bg-pink-100'}`}>
                  <Instagram className={`h-6 w-6 ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`} />
                </div>
                <div>
                  <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Instagram</h3>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>@freschi.raw</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Foto e Biografia - Direita */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-8"
          >
            {/* Foto do Ricardo */}
            <div className="relative">
              <div className={`w-full h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                {biographyImages.length > 0 ? (
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={currentBiographyIndex}
                      src={biographyImages[currentBiographyIndex]} 
                      alt="Ricardo Freschi" 
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                    />
                  </AnimatePresence>
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <div className="text-center">
                      <Camera className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Suas fotos aparecerão aqui
                      </p>
              </div>
                  </div>
                )}
              </div>
              {/* Decoração de fundo */}
              <div className={`absolute -top-4 -left-4 w-full h-full rounded-2xl border-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} -z-10`}></div>
              
              </div>

            {/* Biografia */}
              <div>
              <h2 className={`font-serif text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Biografia
              </h2>
              
              <div className={`space-y-4 text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <p>
                  Sou Ricardo Freschi, fotógrafo apaixonado por registrar momentos únicos e transformar 
                  sentimentos em imagem. Há cerca de 2 anos atuo profissionalmente na fotografia, 
                  sempre buscando transmitir autenticidade e emoção em cada clique.
                </p>
                
                <p>
                  Estudei fotografia pela Cruzeiro do Sul o que me deu uma boa base no audiovisual, 
                  mas foi ao estudar com o fotógrafo Tom Freitas que realmente aprimorei meu olhar e 
                  desenvolvi minha identidade artística. Essa experiência foi fundamental para entender 
                  a fotografia além da técnica como uma forma de expressão capaz de contar histórias e 
                  despertar sensações.
                </p>
                
                <p>
                  Desde então, venho participando de projetos em eventos, retratos e produções 
                  audiovisuais, sempre com a dedicação de capturar não apenas a imagem, mas também 
                  a essência do momento. Para mim, fotografar vai muito além de apertar o botão da 
                  câmera: é viver o instante e transformá-lo em memória.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Componente da página de currículo
function ResumePage({ isDarkMode, biographyImages, currentBiographyIndex }) {
  const [emailCopied, setEmailCopied] = useState(false)
  
  const themedBgStyle = isDarkMode 
    ? { background: 'linear-gradient(135deg, #0F1217 0%, #1a1d24 50%, #0F1217 100%)' }
    : { background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)' }

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('ricardodias2004@gmail.com')
      setEmailCopied(true)
      setTimeout(() => setEmailCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar email:', err)
    }
  }

  const handleCall = () => {
    window.open('tel:+5511957798732', '_self')
  }

  const handleDownloadResume = () => {
    // Criar um link temporário para download
    const link = document.createElement('a')
    link.href = './curriculo-ricardo-freschi.pdf'
    link.download = 'Curriculo-Ricardo-Freschi-2025.pdf'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className={`min-h-screen py-20 px-4 transition-colors duration-300`} style={themedBgStyle}>
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Currículo
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Conheça minha trajetória profissional
          </p>
        </motion.div>

                <div className={`rounded-2xl p-8 shadow-2xl backdrop-blur-sm ${isDarkMode ? 'bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 border border-gray-700/50' : 'bg-gradient-to-br from-white/90 via-gray-50/80 to-white/90 border border-gray-200/50'}`}>
          {/* Layout de duas colunas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Coluna esquerda - Informações */}
            <div className="space-y-6">
              {/* Informações Pessoais */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.h2 
                  className={`text-3xl font-bold mb-4 bg-gradient-to-r ${isDarkMode ? 'from-white via-gray-200 to-white bg-clip-text text-transparent' : 'from-gray-800 via-gray-600 to-gray-800 bg-clip-text text-transparent'}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                  >
                    RICARDO
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    className="ml-2"
                  >
                    FRESCHI
                  </motion.span>
                </motion.h2>
                <p className={`text-lg mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Estudante de Rádio, TV e Internet
                </p>
                <div className="space-y-2">
                  <motion.div 
                    className={`flex items-center justify-between ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div 
                      className="flex items-center cursor-pointer"
                      onClick={handleCopyEmail}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Mail className="w-4 h-4 mr-2 text-blue-400" />
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} hover:text-blue-400 transition-colors duration-200`}>
                        ricardodias2004@gmail.com
                      </span>
                    </motion.div>
                    <button
                      onClick={handleCopyEmail}
                      className={`ml-2 p-1 rounded transition-colors duration-200 ${
                        emailCopied 
                          ? 'text-green-400' 
                          : isDarkMode 
                            ? 'text-gray-400 hover:text-blue-400' 
                            : 'text-gray-500 hover:text-blue-500'
                      }`}
                      title={emailCopied ? 'Email copiado!' : 'Copiar email'}
                    >
                      {emailCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </motion.div>
                  <div className={`flex items-center justify-between ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-green-400" />
                      (11) 95779-8732
                    </div>
                    <motion.button
                      onClick={handleCall}
                      className={`ml-2 p-1 rounded transition-colors duration-200 md:hidden ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-green-400' 
                          : 'text-gray-500 hover:text-green-500'
                      }`}
                      title="Ligar"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <PhoneCall className="w-4 h-4" />
                    </motion.button>
                  </div>
                  <div className={`flex items-center gap-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <div className="flex items-center">
                      <Instagram className="w-4 h-4 mr-2 text-pink-400" />
                      <span className="text-sm font-medium">Redes Sociais</span>
                    </div>
                    <div className="flex gap-2">
                      <motion.a 
                        href="https://instagram.com/freschi.raw" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
                          isDarkMode
                            ? 'bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-orange-500/20 text-pink-300 border border-pink-500/30 hover:from-pink-500/30 hover:via-purple-500/30 hover:to-orange-500/30 hover:border-pink-400/50'
                            : 'bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-orange-500/20 text-pink-700 border border-pink-500/30 hover:from-pink-500/30 hover:via-purple-500/30 hover:to-orange-500/30 hover:border-pink-400/50'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        title="Fotografias"
                      >
                        <CameraIcon className="w-4 h-4" />
                        <span className="font-semibold">@freschi.raw</span>
                      </motion.a>
                      <motion.a 
                        href="https://instagram.com/freschi.jpg" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
                          isDarkMode
                            ? 'bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-orange-500/20 text-pink-300 border border-pink-500/30 hover:from-pink-500/30 hover:via-purple-500/30 hover:to-orange-500/30 hover:border-pink-400/50'
                            : 'bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-orange-500/20 text-pink-700 border border-pink-500/30 hover:from-pink-500/30 hover:via-purple-500/30 hover:to-orange-500/30 hover:border-pink-400/50'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        title="Pessoal"
                      >
                        <User className="w-4 h-4" />
                        <span className="font-semibold">@freschi.jpg</span>
                      </motion.a>
                    </div>
                  </div>
                  <p className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="w-4 h-4 mr-2 text-red-400">📍</span>
                    Rua Barão de Tatuí, 594 - Vila Buarque
                  </p>
                </div>
              </motion.div>

              {/* Resumo Profissional */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Resumo Profissional
                </h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                  Apaixonado por fotografia e equipamentos audiovisuais. Possuo um home studio básico e interesse em produção musical. 
                  Amante de câmeras e sempre em busca de aprimorar minhas habilidades no campo audiovisual.
                </p>
              </motion.div>
            </div>

            {/* Coluna direita - Foto */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex justify-center lg:justify-end"
            >
              <div className="relative group">
                <div className={`w-80 h-80 lg:w-96 lg:h-96 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 group-hover:shadow-3xl group-hover:scale-105 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  {biographyImages && biographyImages.length > 0 ? (
                    <AnimatePresence mode="wait">
                      <motion.img 
                        key={currentBiographyIndex}
                        src={biographyImages[currentBiographyIndex]} 
                        alt="Ricardo Freschi" 
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        style={{
                          imageRendering: 'high-quality',
                          imageRendering: '-webkit-optimize-contrast'
                        }}
                        loading="lazy" />
                    </AnimatePresence>
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Camera className="w-16 h-16" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

                  {/* Linha decorativa entre seções */}
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent mb-8"></div>
                  
                  {/* Experiência Profissional */}
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mb-8"
                  >
            <h3 className={`text-xl font-bold mb-4 bg-gradient-to-r ${isDarkMode ? 'from-white via-gray-300 to-white bg-clip-text text-transparent' : 'from-gray-800 via-gray-600 to-gray-800 bg-clip-text text-transparent'}`}>
              Experiência Profissional
            </h3>
            <div className="space-y-4">
              <div className={`p-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg ${isDarkMode ? 'bg-gray-800/50 hover:bg-gray-800/70' : 'bg-gray-50 hover:bg-gray-100'}`}>
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Editor de vídeo e Auxiliar de Estúdio
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Showcase. | 2024 - 2025
                </p>
                <ul className={`mt-2 space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>• Pós-produção de narração em audiodescrição. Ajustei pausas e equalização do áudio para que a audiodescrição fosse fluida e natural, sem interferir na experiência original do conteúdo.</li>
                  <li>• Suporte técnico em gravações de estúdio. Configurei câmeras, iluminação e vídeo para garantir captação de alta qualidade dos intérpretes de Libras, minimizando retrabalho na pós-produção.</li>
                  <li>• Colaboração com profissionais de acessibilidade. Trabalhei diretamente com roteiristas, locutores e intérpretes de Libras para alinhar o conteúdo às necessidades do público-alvo.</li>
                </ul>
              </div>
              <div className={`p-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg ${isDarkMode ? 'bg-gray-800/50 hover:bg-gray-800/70' : 'bg-gray-50 hover:bg-gray-100'}`}>
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Designer e Social Media
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Pandolfe Joias | 2019 - 2022
                </p>
                <ul className={`mt-2 space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>• Ampliei minha experiência com Adobe Photoshop para Instagram com artes promocionais</li>
                  <li>• Desenvolvi minha experiência em grupo trabalhando em escritório</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Linha decorativa entre seções */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent mb-8"></div>

          {/* Habilidades */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-8"
          >
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Habilidades Técnicas
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Programas
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { name: 'Adobe Photoshop', icon: Palette },
                    { name: 'Adobe Premiere Pro', icon: Video },
                    { name: 'Adobe Illustrator', icon: Image },
                    { name: 'Adobe Lightroom', icon: Image },
                    { name: 'REAPER', icon: Music },
                    { name: 'Audacity', icon: Mic },
                    { name: 'Studio One', icon: Music },
                    { name: 'FL Studio', icon: Music },
                    { name: 'Da Vinci Resolve', icon: Video }
                  ].map((skill, index) => {
                    const IconComponent = skill.icon
                    return (
                      <span
                        key={index}
                        className={`px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all duration-300 hover:scale-110 hover:shadow-md ${
                          isDarkMode
                            ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30 hover:from-indigo-500/30 hover:to-purple-500/30'
                            : 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200 hover:from-indigo-200 hover:to-purple-200'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        {skill.name}
                      </span>
                    )
                  })}
                </div>
              </div>
              
              {/* Linha divisória sutil */}
              <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent my-4"></div>
              
              <div>
                <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Conhecimentos Específicos
                </h4>
                <div className="space-y-2">
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Conhecimento Básico de Câmeras
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Operação e configuração de câmeras para fotografia e filmagem.
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Experiência em Home Studio
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Configuração e uso de equipamentos básicos de produção musical.
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Capacidade de Aprendizado Contínuo
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Compromisso com o aprimoramento constante das habilidades e conhecimentos no campo audiovisual.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Linha decorativa entre seções */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent mb-8"></div>

          {/* Educação */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mb-8"
          >
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Educação
            </h3>
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Universidade Cruzeiro do Sul
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Rádio, TV e Internet | 2024
                </p>
                <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Graduação em andamento com foco em produção audiovisual, comunicação e mídias digitais.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Saga - School of Art
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Curso | 2016-2020
                </p>
                <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Formação em artes digitais, design e produção audiovisual.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Linha decorativa entre seções */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent mb-8"></div>

          {/* Idiomas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mb-8"
          >
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Idiomas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Português
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Nativo
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Inglês
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Avançado
                </p>
              </div>
            </div>
          </motion.div>

          {/* Linha decorativa final */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent mb-8"></div>

          {/* Botão de Download */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="text-center"
          >
            <button
              onClick={handleDownloadResume}
              className={`inline-flex items-center px-8 py-4 rounded-lg text-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl relative overflow-hidden group ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-white to-gray-200 hover:from-gray-200 hover:to-white text-gray-900'
                  : 'bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <Camera className="w-5 h-5 mr-2" />
              Baixar Currículo PDF
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedImageForGallery, setSelectedImageForGallery] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Verifica se há preferência salva no localStorage
    const savedTheme = localStorage.getItem('darkMode')
    return savedTheme ? JSON.parse(savedTheme) : true
  })
  
  // Estado para imagens de fundo rotativas
  const backgroundImages = importBackgroundImages()
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0)
  
  // Estado para fotos da biografia rotativas
  const biographyImages = importBiographyImages()
  const [currentBiographyIndex, setCurrentBiographyIndex] = useState(0)

  // Salva a preferência no localStorage sempre que o modo escuro muda
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
  }, [isDarkMode])

  // Rotação automática das imagens de fundo
  useEffect(() => {
    if (backgroundImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentBackgroundIndex((prevIndex) => 
          (prevIndex + 1) % backgroundImages.length
        )
      }, 60000) // Muda a cada 1 minuto
      
      return () => clearInterval(interval)
    }
  }, [backgroundImages.length])

  // Rotação automática das fotos da biografia
  useEffect(() => {
    if (biographyImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentBiographyIndex((prevIndex) => 
          (prevIndex + 1) % biographyImages.length
        )
      }, 60000) // Muda a cada 1 minuto
      
      return () => clearInterval(interval)
    }
  }, [biographyImages.length])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleImageClick = (image) => {
    setSelectedImageForGallery(image)
    setCurrentPage('galeria')
  }

  // Limpa a imagem selecionada quando navega para outras páginas
  const handlePageChange = (page) => {
    if (page !== 'galeria') {
      setSelectedImageForGallery(null)
    }
    setCurrentPage(page)
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={handlePageChange} isDarkMode={isDarkMode} onImageClick={handleImageClick} backgroundImages={backgroundImages} currentBackgroundIndex={currentBackgroundIndex} />
      case 'galeria':
        return <GalleryPage isDarkMode={isDarkMode} selectedImage={selectedImageForGallery} />
      case 'projetos':
        return <ProjectsPage isDarkMode={isDarkMode} />
      case 'contato':
        return <ContactPage isDarkMode={isDarkMode} biographyImages={biographyImages} currentBiographyIndex={currentBiographyIndex} />
      case 'curriculo':
        return <ResumePage isDarkMode={isDarkMode} biographyImages={biographyImages} currentBiographyIndex={currentBiographyIndex} />
      default:
        return <HomePage setCurrentPage={handlePageChange} isDarkMode={isDarkMode} onImageClick={handleImageClick} />
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? '' : 'bg-white'}`} style={isDarkMode ? { backgroundColor: '#0F1217' } : {}}>
      <Navigation 
        currentPage={currentPage} 
        setCurrentPage={handlePageChange} 
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default App

