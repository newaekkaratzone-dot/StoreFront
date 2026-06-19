
import { useTranslation } from '../store';
import { useSearchParams } from 'react-router-dom';

export default function Sidebar() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const handlePriceChange = (min: string, max: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (min) newParams.set('unit_price__gte', min);
    else newParams.delete('unit_price__gte');
    
    if (max) newParams.set('unit_price__lte', max);
    else newParams.delete('unit_price__lte');
    
    setSearchParams(newParams);
  };



  const resetPrice = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('unit_price__gte');
    newParams.delete('unit_price__lte');
    setSearchParams(newParams);
  };

  return (
    <aside className="w-64 flex-shrink-0 mr-8 hidden lg:block">
      {/* Price Range */}
      <div className="bg-surface dark:bg-dark-surface p-6 rounded-2xl shadow-sm mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-secondary dark:text-dark-text">{t.priceRange}</h3>
          <span onClick={resetPrice} className="text-xs text-muted dark:text-dark-muted cursor-pointer hover:text-primary">{t.reset || 'Reset'}</span>
        </div>
        <p className="text-xs text-muted dark:text-dark-muted mb-4">{t.averagePrice}</p>
        
        {/* Simple Price Inputs */}
        <div className="flex space-x-2 mb-4">
          <input 
            type="number" 
            placeholder={t.min || 'Min'}
            className="w-1/2 p-2 text-xs border rounded-lg bg-background dark:bg-dark-bg text-secondary dark:text-dark-text"
            value={searchParams.get('unit_price__gte') || ''}
            onChange={e => handlePriceChange(e.target.value, searchParams.get('unit_price__lte') || '')}
          />
          <input 
            type="number" 
            placeholder={t.max || 'Max'}
            className="w-1/2 p-2 text-xs border rounded-lg bg-background dark:bg-dark-bg text-secondary dark:text-dark-text"
            value={searchParams.get('unit_price__lte') || ''}
            onChange={e => handlePriceChange(searchParams.get('unit_price__gte') || '', e.target.value)}
          />
        </div>
      </div>

    </aside>
  );
}
