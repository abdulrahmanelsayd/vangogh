// This file contains the names and descriptions for all 56 paintings in the gallery.
// You can edit the "title" and "description" for any painting here.
// The key (e.g., "1", "2") corresponds to the image file name (1.jpg, 2.webp, etc.).

export const paintingsData = {
    "1": {
        title: "The Starry Night",
        description: "The year is 1889. In the quiet, shadowy room of the Saint-Paul-de-Mausole asylum in southern France, a troubled artist stands by his east-facing window. The world outside is fast asleep, but Vincent van Gogh’s mind is wide awake. He looks out into the darkness just before sunrise, where the \"morning star\"—Venus—glows fiercely against the fading night.\n\nHe doesn't reach for his brushes to paint a mere copy of the landscape. Instead, he paints to capture the roaring, turbulent emotion he feels inside.\n\nUpon his canvas, the night sky comes alive. It isn't a still, quiet canopy, but a dynamic, swirling ocean of deep blues and radiant yellows. Giant, sweeping currents of wind curl across the heavens, cradling a brilliantly glowing crescent moon and oversized stars that seem to pulsate with explosive energy.\n\nIn the foreground, a massive, dark cypress tree rises like a twisting green flame. Traditionally a symbol of death and mourning, the tree stretches upward, acting as an anchor that connects the heavy, sorrowful earth to the vibrant, infinite energy of the sky above.\n\nFar below the chaotic heavens rests a peaceful, sleeping village. Interestingly, this village wasn't actually visible from his asylum window. Vincent painted it from memory, adding a tall, sharp church spire that echoes the architecture of his Dutch homeland, grounding his swirling cosmos with a touch of quiet, human nostalgia.\n\nWith thick, aggressive brushstrokes—a technique known as impasto—Vincent literally built the painting, layer by heavy layer. He wasn't just applying color; he was carving his feelings into the canvas. The Starry Night was born not from a place of perfect peace, but from profound struggle, transforming an artist's deep isolation into one of history's most beautiful and universally recognized masterpieces."
    },
    "2": {
        title: "Flowering Plum Orchard (after Hiroshige)",
        description: "Left by the artist at the apartment of his brother Theo van Gogh, Paris, October-November 1887; after his death on 25 January 1891, inherited by his widow, Jo van Gogh-Bonger, and their son, Vincent Willem van Gogh, Paris; administered until her death on 2 September 1925 by Jo van Gogh-Bonger, Bussum/Amsterdam/Laren; given on loan by Vincent Willem van Gogh, Laren to the Stedelijk Museum, Amsterdam, since 22 October 1931; donated by Vincent Willem van Gogh to the (1st) Vincent van Gogh Foundation, Laren, 11 March 1952; transferred by the (1st) Vincent van Gogh Foundation to the Theo van Gogh Foundation, Laren, 28 December 1960; agreement concluded on 21 July 1962 between the (2nd) Vincent van Gogh Foundation, Amsterdam, and the State of the Netherlands, in which the preservation and management of the collection, and its placing in the Rijksmuseum Vincent van Gogh, to be realized in Amsterdam, is entrusted to the State; donated on 21 July 1962 by the Theo van Gogh Foundation to the Vincent van Gogh Foundation; given on loan until the opening of the museum on 2 June 1973 to the Stedelijk Museum, Amsterdam; on permanent loan to the Rijksmuseum Vincent van Gogh from 2 June 1973 and at the Van Gogh Museum, Amsterdam, since 1 July 1994."
    },
    "3": {
        title: "Olive Trees on a Hillside",
        description: "With his brother Theo van Gogh, Paris, after December 1889; after his death on 25 January 1891, inherited by his widow, Jo van Gogh-Bonger, and their son, Vincent Willem van Gogh, Paris; administered until her death on 2 September 1925 by Jo van Gogh-Bonger, Bussum/Amsterdam/Laren; transferred by Vincent Willem van Gogh, Laren, on 10 July 1962 to the Vincent van Gogh Foundation, Amsterdam; agreement concluded between the Vincent van Gogh Foundation and the State of the Netherlands, in which the preservation and management of the collection, and its placing in the Rijksmuseum Vincent van Gogh, to be realized in Amsterdam, is entrusted to the State, 21 July 1962; given on loan until the opening of the museum on 2 June 1973 to the Stedelijk Museum, Amsterdam; on permanent loan to the Rijksmuseum Vincent van Gogh from 2 June 1973 and at the Van Gogh Museum, Amsterdam, since 1 July 1994."
    },
    "4": {
        title: "Vase with Chinese Asters and Gladioli",
        description: "Vincent van Gogh (1853 - 1890), Paris, August-September 1886\n\nVan Gogh had always used generous amounts of paint. But after discovering the flower still lifes of Adolphe Monticelli (1824-1886) in June 1886, he went one step further. That French artist painted colourful bouquets with thick paint and emphatic brushstrokes. Van Gogh compared them to liquid clay. In still lifes such as Vase with Chinese Asters and Gladioli, you can see how thickly he began applying the paint to the canvas in his own flowers.\n\nThe vase shown here has been preserved and is now in the Van Gogh Museum collection. It is smaller in reality than in the painting. The large bouquet of flowers shown here would never fit inside it."
    },
    "5": {
        title: "Vase with Honesty",
        description: "Vincent van Gogh (1853 - 1890), Nuenen, Autumn-Winter 1884\n\nIn the autumn of 1884, Van Gogh began work on this seasonal bouquet of honesty, with 'dry leaves against blue'.\n\nThe name 'honesty' may refer to the translucence of the round seed pods, which turn a silvery-white colour in the autumn. They then resemble silver coins, and in Dutch this plant is called the judaspenning, 'coin of Judas'. This is a reference to the apostle Judas, who betrayed Christ for 30 pieces of silver. He is said to have thrown the coins to the ground when he hanged himself. Where they landed, the honesty plant later grew. This is one of the first still lifes painted by Van Gogh."
    },
    "6": {
        title: "Wheatfield with Crows",
        description: "Vincent van Gogh (1853 - 1890), Auvers-sur-Oise, July 1890\n\nWheatfield with Crows is one of Van Gogh's most famous paintings. It is often claimed that this was his very last work. The menacing sky, the crows and the dead-end path are said to refer to the end of his life approaching. But that is just a persistent myth. In fact, he made several other works after this one.\n\nVan Gogh did want his wheatfields under stormy skies to express 'sadness, extreme loneliness', but at the same time he wanted to show what he considered 'healthy and fortifying about the countryside'.\n\nVan Gogh used powerful colour combinations in this painting: the blue sky contrasts with the yellow-orange wheat, while the red of the path is intensified by the green bands of grass."
    },
    // The following are default placeholders. Please replace them with real Van Gogh painting data.
    ...Array.from({ length: 50 }, (_, i) => i + 7).reduce((acc, num) => {
        acc[num.toString()] = {
            title: `Masterpiece ${num}`,
            description: "This piece transcends the visual plane, pulling the observer into a chaotic yet perfect symphony of color and emotion."
        };
        return acc;
    }, {})
};
