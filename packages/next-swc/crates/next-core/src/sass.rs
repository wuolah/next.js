use anyhow::{bail, Result};
use turbo_tasks::primitives::JsonValueVc;
use turbopack_binding::turbopack::{
    node::transforms::webpack::{WebpackLoaderItem, WebpackLoaderItemsVc},
    turbopack::module_options::{LoaderRuleItem, OptionWebpackRulesVc, WebpackRulesVc},
};

#[turbo_tasks::function]
pub async fn maybe_add_sass_loader(
    sass_options: JsonValueVc,
    webpack_rules: Option<WebpackRulesVc>,
) -> Result<OptionWebpackRulesVc> {
    let sass_options = sass_options.await?;
    let Some(sass_options) = sass_options.as_object() else {
        bail!("sass_options must be an object");
    };
    let mut rules = if let Some(webpack_rules) = webpack_rules {
        webpack_rules.await?.clone_value()
    } else {
        Default::default()
    };
    for pattern in ["*.scss", "*.sass"] {
        let rule = rules.get_mut(pattern);
        let loader = WebpackLoaderItem {
            loader: "next/dist/compiled/sass-loader".to_string(),
            options: serde_json::json!({
                //https://github.com/vercel/turbo/blob/d527eb54be384a4658243304cecd547d09c05c6b/crates/turbopack-node/src/transforms/webpack.rs#L191
                "sourceMap": false,
                "sassOptions": sass_options,
            })
            .as_object()
            .unwrap()
            .clone(),
        };

        if let Some(rule) = rule {
            let mut loaders = rule.loaders.await?.clone_value();
            loaders.push(loader);
            rule.loaders = WebpackLoaderItemsVc::cell(loaders);
        } else {
            rules.insert(
                pattern.to_string(),
                LoaderRuleItem {
                    loaders: WebpackLoaderItemsVc::cell(vec![loader]),
                    rename_as: Some("*".to_string()),
                },
            );
        }
    }

    Ok(OptionWebpackRulesVc::cell(Some(WebpackRulesVc::cell(
        rules,
    ))))
}
