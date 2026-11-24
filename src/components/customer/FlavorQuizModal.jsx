import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Sparkles, Check, ArrowRight, RotateCcw, Heart, ShoppingBag } from 'lucide-react';
import confetti from 'canvas-confetti';

const QUESTIONS = [
  {
    id: 'occasion',
    title: 'What is your current craving or occasion?',
    subtitle: 'Help us pinpoint the perfect sensation for this moment',
    options: [
      { id: 'digestive', label: 'Post-Meal Digestive', icon: '🌿', hint: 'Soothing cardamom, rose gulkand & sweet saunf' },
      { id: 'sweet', label: 'Sweet Dessert Craving', icon: '🍓', hint: 'Rich berry, dark chocolate & sweet coconut' },
      { id: 'royal', label: 'Royal Special Indulgence', icon: '👑', hint: 'Gold vark, kesar & majestic Banarasi recipe' },
      { id: 'ice', label: 'Chilled Ice Freshness', icon: '❄️', hint: 'Cooling menthol blast & crisp cold leaf' }
    ]
  },
  {
    id: 'flavor',
    title: 'Which flavor profile excites your tastebuds?',
    subtitle: 'Choose the flavor foundation you love most',
    options: [
      { id: 'flavored', label: 'Fruity & Modern Fusion', icon: '🍇', hint: 'Blackcurrant, Blueberry, or Dark Chocolate' },
      { id: 'meetha', label: 'Classic Meetha Paan', icon: '🌹', hint: 'Authentic Calcutta leaf with gulkand & cherries' },
      { id: 'royal', label: 'Imperial Silver & Saffron', icon: '✨', hint: 'Silver Kesar, Rampyari & royal aromatic blend' },
      { id: 'traditional', label: 'Authentic Banarasi Spices', icon: '🌱', hint: 'Banaras 120 300, roasted kattha & masala' }
    ]
  },
  {
    id: 'supari',
    title: 'What is your supari / tobacco preference?',
    subtitle: 'We strictly provide fresh, gourmet and compliant delicacies',
    options: [
      { id: 'herbal', label: '100% Herbal & Supari-Free', icon: '🍃', hint: 'Zero supari, pure mukhwas & aromatic spices' },
      { id: 'traditional_mukhwas', label: 'Sweet Flavored Kashmiri Supari', icon: '🌰', hint: 'Tender scented meetha supari shavings' },
      { id: 'any', label: 'No Preference / Open to Surprise', icon: '🎯', hint: 'Let our Paan Master decide the best recipe' }
    ]
  }
];

export const FlavorQuizModal = () => {
  const { isFlavorQuizOpen, setIsFlavorQuizOpen, products, addToCart, setIsCartOpen, setQuickViewProduct } = useStore();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (!isFlavorQuizOpen) {
      setStep(0);
      setAnswers({});
      setRecommendations([]);
    }
  }, [isFlavorQuizOpen]);

  if (!isFlavorQuizOpen) return null;

  const currentQ = QUESTIONS[step];

  const handleSelectOption = (optionId) => {
    const updated = { ...answers, [currentQ.id]: optionId };
    setAnswers(updated);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      // Calculate Recommendations
      calculateResults(updated);
    }
  };

  const calculateResults = (finalAnswers) => {
    // Score products based on category and tags
    const scored = products.map((prod) => {
      let score = 50;

      // Category match
      if (finalAnswers.flavor && prod.category === finalAnswers.flavor) {
        score += 30;
      }

      // Occasion match
      if (finalAnswers.occasion === 'sweet' && (prod.category === 'flavored' || prod.name.includes('Chocolate') || prod.name.includes('Berry'))) {
        score += 25;
      }
      if (finalAnswers.occasion === 'royal' && (prod.category === 'royal' || prod.name.includes('Kesar') || prod.name.includes('Silver') || prod.name.includes('Rampyari'))) {
        score += 35;
      }
      if (finalAnswers.occasion === 'ice' && (prod.name.includes('Ice') || prod.ingredients?.includes('Menthol') || prod.description?.includes('cooling'))) {
        score += 35;
      }
      if (finalAnswers.occasion === 'digestive' && (prod.category === 'meetha' || prod.name.includes('Meetha') || prod.name.includes('Saunf'))) {
        score += 30;
      }

      // Stock & availability bonus
      if (prod.available && Number(prod.stockQuantity) > 0) {
        score += 10;
      }

      return {
        product: prod,
        matchScore: Math.min(99, Math.max(78, score))
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);
    const topMatches = scored.slice(0, 3);
    setRecommendations(topMatches);
    setStep(QUESTIONS.length); // Results step

    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  const handleAddAndOrder = (prod) => {
    addToCart(prod, 1);
    setIsCartOpen(true);
    setIsFlavorQuizOpen(false);
  };

  return (
    <div
      className="modal-backdrop"
      onClick={() => setIsFlavorQuizOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Paan Flavor Finder Quiz"
    >
      <div className="modal-card flavor-quiz-card animate-modal-scale" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="quiz-header-badge">
            <Sparkles size={14} style={{ color: 'var(--primary)' }} />
            <span>PAAN FLAVOR FINDER</span>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={() => setIsFlavorQuizOpen(false)}
            aria-label="Close flavor quiz"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body quiz-modal-body">
          {step < QUESTIONS.length ? (
            <div className="quiz-question-screen animate-fade-in">
              <div className="quiz-progress-bar">
                <div
                  className="quiz-progress-fill"
                  style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
                ></div>
              </div>

              <div className="quiz-step-tracker">
                Question {step + 1} of {QUESTIONS.length}
              </div>

              <h3 className="quiz-question-title">{currentQ.title}</h3>
              <p className="quiz-question-subtitle">{currentQ.subtitle}</p>

              <div className="quiz-options-list">
                {currentQ.options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className="quiz-option-button"
                    onClick={() => handleSelectOption(opt.id)}
                  >
                    <span className="quiz-option-icon">{opt.icon}</span>
                    <div className="quiz-option-info">
                      <div className="quiz-option-label">{opt.label}</div>
                      <div className="quiz-option-hint">{opt.hint}</div>
                    </div>
                    <ArrowRight size={16} className="quiz-option-arrow" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="quiz-results-screen animate-fade-in">
              <div className="quiz-results-header">
                <div className="quiz-results-sparkle">👑</div>
                <h3 className="quiz-results-title">Your Handpicked Matches</h3>
                <p className="quiz-results-subtitle">
                  Based on your preferences, our Master Paan makers recommend these authentic specialties:
                </p>
              </div>

              <div className="quiz-results-grid">
                {recommendations.map(({ product, matchScore }) => (
                  <div key={product.id} className="quiz-recommendation-card">
                    <div className="quiz-rec-img-box">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="quiz-rec-img"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <span className="quiz-match-pill">{matchScore}% Match</span>
                    </div>

                    <div className="quiz-rec-content">
                      <div className="quiz-rec-category">{product.category}</div>
                      <h4 className="quiz-rec-name">{product.name}</h4>
                      <p className="quiz-rec-desc">{product.description}</p>

                      <div className="quiz-rec-footer">
                        <div className="quiz-rec-price">₹{product.price}</div>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm btn-gold-shimmer"
                          onClick={() => handleAddAndOrder(product)}
                        >
                          <ShoppingBag size={13} />
                          <span>Order Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="quiz-results-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setStep(0);
                    setAnswers({});
                  }}
                >
                  <RotateCcw size={14} />
                  <span>Retake Quiz</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsFlavorQuizOpen(false)}
                >
                  <span>Explore Full Menu</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
