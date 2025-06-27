import { X } from 'lucide-react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Array<{ name: string; slug: string }>;
}

export function MobileMenu({ isOpen, onClose, categories }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onClose}
          />
          
          {/* Menu */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 lg:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-900">Menu</h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Navigation */}
              <div className="flex-1 overflow-y-auto p-6">
                <nav className="space-y-4">
                  <Link
                    href="/"
                    onClick={onClose}
                    className="block py-3 px-4 text-slate-700 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-colors duration-200 font-medium"
                  >
                    Home
                  </Link>
                  
                  <Link
                    href="/products"
                    onClick={onClose}
                    className="block py-3 px-4 text-slate-700 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-colors duration-200 font-medium"
                  >
                    Products
                  </Link>
                  
                  <Link
                    href="/comparison"
                    onClick={onClose}
                    className="block py-3 px-4 text-slate-700 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-colors duration-200 font-medium"
                  >
                    Compare Products
                  </Link>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider px-4">Categories</h4>
                    {categories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/category/${category.slug}`}
                        onClick={onClose}
                        className="block py-3 px-4 text-slate-700 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-colors duration-200"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </nav>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
