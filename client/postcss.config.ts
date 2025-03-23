import autoprefixer from 'autoprefixer';
import tailwind from 'tailwindcss';

import tailwindConfig from './tailwind.config';

export default {
    plugins: [tailwind(tailwindConfig), autoprefixer],
};
